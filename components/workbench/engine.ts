/**
 * The workbench's 3D: plain three.js, no React in here.
 *
 * The model is drawn the way the rest of the site is drawn - ink on paper:
 * a cream fill, bold black edges (fat lines, since WebGL's own lines are one
 * pixel whatever you ask for), and pencil construction boxes. The look is
 * one material each, set once; everything that moves is a uniform, a draw
 * count or a transform, so nothing is rebuilt while it moves.
 *
 * The story is one number, `stage`, from 0 to 4 (5 belongs to the DOM: the
 * photograph of the real thing):
 *
 *   0 → 1  SKETCH     pencil boxes round each part, drawn in
 *   1 → 2  WIREFRAME  the ink edges, drawn top to bottom like a plotter
 *   2 → 3  SURFACE    the parts' fills come up
 *   3 → 4  ASSEMBLY   the parts, laid out apart until now, go together one
 *                      by one, each with a small settle as it lands
 *   4      FINAL      the pencil goes, the finished model is left
 *
 * On top of that, things the visitor does: drag to turn it (the pointer
 * leans it a little when not dragging), explode it (the parts slide out
 * along the line from the model's centre to theirs), and pick a part out
 * (it takes the duck's yellow, the rest step back).
 *
 * Frames are only drawn while something is still moving, and only while the
 * canvas is on screen; a still model costs nothing.
 */
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { LineSegments2 } from 'three/examples/jsm/lines/LineSegments2.js'
import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry.js'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js'

const PAPER = new THREE.Color('#f7f4ec')
const DUCK = new THREE.Color('#f5be5b')
const INK = new THREE.Color('#111111')

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const ease = (t: number) => 1 - Math.pow(1 - t, 3)
// a small overshoot as a part lands: it goes in, a touch past, and settles
const settle = (t: number) => {
  const c = 1.4
  return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2)
}

type Part = {
  key: string
  group: THREE.Group
  fill: THREE.MeshLambertMaterial
  ink: LineMaterial
  edges: LineSegments2
  edgeCount: number
  pencil: LineSegments2
  pencilCount: number
  center: THREE.Vector3
  /** where it lies before assembly and how far it slides when exploded */
  out: THREE.Vector3
  landed: boolean
}

/** a part's anchor on screen, and where its label goes (lx, ly), already
 *  pushed apart from the other labels */
export type Placement = { key: string; x: number; y: number; lx: number; ly: number; visible: boolean }

export type BenchEvents = {
  /** each part's anchor on screen, whenever it moves (for the labels) */
  onPlace?: (p: Placement[]) => void
  /** the part under the pointer, when it changes */
  onHover?: (key: string | null) => void
  /** a part has just gone home during assembly: a tick at that spot */
  onLand?: (x: number, y: number) => void
  /** the visitor turned the model */
  onTurn?: () => void
}

export class Bench {
  private renderer: THREE.WebGLRenderer
  private scene = new THREE.Scene()
  private camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -5000, 5000)
  private root = new THREE.Group() // the turn
  private model = new THREE.Group() // the parts, centred
  private parts: Part[] = []
  private radius = 100
  private view = { yaw: -0.61, pitch: 0.42 }
  private yaw = { now: -0.61, to: -0.61 }
  private pitch = { now: 0.42, to: 0.42 }
  private lean = { x: 0, y: 0, nx: 0, ny: 0 }
  private stage = { now: 0, to: 0 }
  private explode = { now: 0, to: 0 }
  private presence = { now: 1, to: 1 } // 0 = collapsed into nothing, for switching
  private highlight: string | null = null
  private hlMix = new Map<string, number>()
  private hoverKey: string | null = null
  private width = 1
  private height = 1
  private raf = 0
  private visible = true
  private dragging = false
  private last = { x: 0, y: 0 }
  private ray = new THREE.Raycaster()
  private disposed = false
  private loader = new GLTFLoader()
  private reduce: boolean

  constructor(
    private canvas: HTMLCanvasElement,
    private events: BenchEvents = {},
    opts: { reduce?: boolean } = {},
  ) {
    this.reduce = !!opts.reduce
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75))
    this.renderer.setClearColor(0x000000, 0)
    this.scene.add(new THREE.AmbientLight(0xffffff, 2.1))
    const sun = new THREE.DirectionalLight(0xffffff, 1.15)
    sun.position.set(-0.6, 1, 0.8)
    this.scene.add(sun)
    this.root.add(this.model)
    this.scene.add(this.root)
    this.root.rotation.order = 'XYZ'
    this.bind()
  }

  /* ── loading ─────────────────────────────────────────────────────────── */

  async load(url: string, view: { yaw: number; pitch: number }): Promise<string[]> {
    const gltf = await this.loader.loadAsync(url)
    if (this.disposed) return []
    this.clear()
    // the build script's view, the turn its sketch was drawn from: the same
    // rotations in the same order (pitch after yaw), so the two agree
    this.view = { yaw: view.yaw, pitch: view.pitch }
    this.yaw.to = this.yaw.now = this.view.yaw
    this.pitch.to = this.pitch.now = this.view.pitch

    const meshes: THREE.Mesh[] = []
    gltf.scene.updateMatrixWorld(true)
    gltf.scene.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) meshes.push(o as THREE.Mesh)
    })
    const all = new THREE.Box3()
    meshes.forEach((m) => all.expandByObject(m))
    const mid = all.getCenter(new THREE.Vector3())
    const size = all.getSize(new THREE.Vector3())
    this.radius = size.length() / 2
    let biggest = 0
    meshes.forEach((m) => (biggest = Math.max(biggest, new THREE.Box3().setFromObject(m).getSize(new THREE.Vector3()).length())))

    for (const m of meshes) {
      // the node's name is the part's key (scripts/cad/build.py)
      const key = (m.parent && m.parent !== gltf.scene ? m.parent.name : m.name) || m.name
      const geo = (m.geometry as THREE.BufferGeometry).clone()
      geo.applyMatrix4(m.matrixWorld)
      geo.translate(-mid.x, -mid.y, -mid.z)
      geo.computeVertexNormals()
      geo.computeBoundingBox()
      const bb = geo.boundingBox!
      const center = bb.getCenter(new THREE.Vector3())

      const fill = new THREE.MeshLambertMaterial({
        color: PAPER.clone(),
        transparent: true,
        opacity: 0,
        polygonOffset: true,
        polygonOffsetFactor: 1,
        polygonOffsetUnits: 1,
        side: THREE.DoubleSide,
      })
      const mesh = new THREE.Mesh(geo, fill)
      mesh.userData.key = key

      // ink: the part's edges, sorted top to bottom so they draw like a plotter
      const eg = new THREE.EdgesGeometry(geo, 28)
      const pos = eg.getAttribute('position').array as Float32Array
      const segs: number[][] = []
      for (let i = 0; i < pos.length; i += 6) segs.push(Array.from(pos.subarray(i, i + 6)))
      segs.sort((a, b) => Math.max(b[1], b[4]) - Math.max(a[1], a[4]))
      const lg = new LineSegmentsGeometry()
      lg.setPositions(segs.flat())
      const ink = new LineMaterial({ color: INK.getHex(), linewidth: 1.6, transparent: true, opacity: 1, worldUnits: false })
      const edges = new LineSegments2(lg, ink)
      edges.renderOrder = 2

      // pencil: the box the part was drawn inside
      const b = bb
      const c = [
        [b.min.x, b.min.y, b.min.z], [b.max.x, b.min.y, b.min.z], [b.max.x, b.max.y, b.min.z], [b.min.x, b.max.y, b.min.z],
        [b.min.x, b.min.y, b.max.z], [b.max.x, b.min.y, b.max.z], [b.max.x, b.max.y, b.max.z], [b.min.x, b.max.y, b.max.z],
      ]
      const E = [0, 1, 1, 2, 2, 3, 3, 0, 4, 5, 5, 6, 6, 7, 7, 4, 0, 4, 1, 5, 2, 6, 3, 7]
      const pg = new LineSegmentsGeometry()
      pg.setPositions(E.flatMap((i) => c[i]))
      const pencilMat = new LineMaterial({ color: INK.getHex(), linewidth: 1, transparent: true, opacity: 0.28, worldUnits: false })
      const pencil = new LineSegments2(pg, pencilMat)

      const group = new THREE.Group()
      group.add(mesh, edges, pencil)
      this.model.add(group)

      // laid out apart before assembly: along the line from the model's
      // centre to the part's, the biggest part (the frame) staying put
      const own = bb.getSize(new THREE.Vector3()).length()
      const dir = center.clone()
      const out = new THREE.Vector3()
      if (own < biggest * 0.98 && dir.length() > 0.01 * this.radius) out.copy(dir.normalize().multiplyScalar(this.radius * 0.7))
      else if (meshes.length > 1 && own < biggest * 0.98) out.set(0, this.radius * 0.7, 0)
      // a single-part model drops in from above instead
      const single = meshes.length === 1
      this.parts.push({
        key,
        group,
        fill,
        ink,
        edges,
        edgeCount: segs.length,
        pencil,
        pencilCount: 12,
        center,
        out: single ? new THREE.Vector3(0, this.radius * 0.5, 0) : out,
        landed: false,
      })
    }
    // the model's resting radius, with the parts laid out round it
    this.radius = Math.max(this.radius, ...this.parts.map((p) => p.center.clone().add(p.out).length() + this.radius * 0.25)) * 0.82
    this.resize()
    this.kick()
    return this.parts.map((p) => p.key)
  }

  private clear() {
    for (const p of this.parts) {
      p.group.traverse((o) => {
        const any = o as THREE.Mesh
        any.geometry?.dispose?.()
      })
      p.fill.dispose()
      p.ink.dispose()
      ;(p.pencil.material as LineMaterial).dispose()
      this.model.remove(p.group)
    }
    this.parts = []
    this.hlMix.clear()
  }

  /* ── what the page tells it ──────────────────────────────────────────── */

  setStage(s: number) {
    this.stage.to = s
    if (this.reduce) this.stage.now = s
    this.kick()
  }
  setExplode(on: boolean) {
    this.explode.to = on ? 1 : 0
    this.kick()
  }
  setHighlight(key: string | null) {
    this.highlight = key
    this.kick()
  }
  setVisible(v: boolean) {
    this.visible = v
    if (v) this.kick()
  }
  resetView() {
    this.yaw.to = this.view.yaw
    this.pitch.to = this.view.pitch
    this.kick()
  }
  /** fold the current model away (lines undrawn, fills gone) */
  async collapse() {
    this.presence.to = 0
    this.kick()
    await new Promise((r) => setTimeout(r, this.reduce ? 0 : 320))
  }
  /** draw the (newly loaded) model back in */
  emerge() {
    this.presence.now = 0
    this.presence.to = 1
    this.kick()
  }

  resize() {
    const r = this.canvas.getBoundingClientRect()
    this.width = Math.max(1, r.width)
    this.height = Math.max(1, r.height)
    this.renderer.setSize(this.width, this.height, false)
    const aspect = this.width / this.height
    let half = this.radius * 0.9
    if (aspect < 1) half /= aspect
    this.camera.left = -half * aspect
    this.camera.right = half * aspect
    this.camera.top = half
    this.camera.bottom = -half
    this.camera.position.set(0, 0, 1000)
    this.camera.updateProjectionMatrix()
    for (const p of this.parts) {
      p.ink.resolution.set(this.width, this.height)
      ;(p.pencil.material as LineMaterial).resolution.set(this.width, this.height)
    }
    this.kick()
  }

  dispose() {
    this.disposed = true
    cancelAnimationFrame(this.raf)
    this.unbind()
    this.clear()
    this.renderer.dispose()
  }

  /* ── input ───────────────────────────────────────────────────────────── */

  private handlers: [string, EventListener][] = []
  private bind() {
    const on = (type: string, fn: (e: PointerEvent) => void) => {
      this.canvas.addEventListener(type, fn as EventListener)
      this.handlers.push([type, fn as EventListener])
    }
    on('pointerdown', (e) => {
      this.dragging = true
      this.last = { x: e.clientX, y: e.clientY }
      this.canvas.setPointerCapture(e.pointerId)
    })
    on('pointermove', (e) => {
      const r = this.canvas.getBoundingClientRect()
      const nx = ((e.clientX - r.left) / r.width) * 2 - 1
      const ny = -(((e.clientY - r.top) / r.height) * 2 - 1)
      if (this.dragging) {
        const dx = e.clientX - this.last.x
        const dy = e.clientY - this.last.y
        this.last = { x: e.clientX, y: e.clientY }
        this.yaw.to += dx * 0.009
        // a finger only turns it round: up and down is the page's scroll
        if (e.pointerType === 'mouse') this.pitch.to = Math.min(1.25, Math.max(-0.2, this.pitch.to + dy * 0.006))
        this.events.onTurn?.()
        this.kick()
        return
      }
      if (e.pointerType === 'mouse') {
        this.lean.nx = nx
        this.lean.ny = ny
        this.pick(nx, ny)
        this.kick()
      }
    })
    const up = (e: PointerEvent) => {
      this.dragging = false
      if (this.canvas.hasPointerCapture?.(e.pointerId)) this.canvas.releasePointerCapture(e.pointerId)
    }
    on('pointerup', up)
    on('pointercancel', up)
    on('pointerleave', () => {
      this.lean.nx = 0
      this.lean.ny = 0
      if (this.hoverKey !== null) {
        this.hoverKey = null
        this.events.onHover?.(null)
      }
      this.kick()
    })
  }
  private unbind() {
    for (const [t, f] of this.handlers) this.canvas.removeEventListener(t, f)
    this.handlers = []
  }
  private pick(nx: number, ny: number) {
    if (this.parts.length < 2 || this.stage.now < 2.5) return
    this.ray.setFromCamera(new THREE.Vector2(nx, ny), this.camera)
    const meshes = this.parts.map((p) => p.group.children[0])
    const hit = this.ray.intersectObjects(meshes, false)[0]
    const key = (hit?.object.userData.key as string | undefined) ?? null
    if (key !== this.hoverKey) {
      this.hoverKey = key
      this.events.onHover?.(key)
    }
  }

  /* ── the frame loop ──────────────────────────────────────────────────── */

  private kick() {
    if (this.raf || this.disposed) return
    this.raf = requestAnimationFrame(this.frame)
  }

  private frame = () => {
    this.raf = 0
    if (!this.visible || this.disposed) return
    const k = this.reduce ? 1 : 0.14
    let moving = false
    const step = (v: { now: number; to: number }, rate = k) => {
      const d = v.to - v.now
      if (Math.abs(d) < 0.0005) v.now = v.to
      else {
        v.now += d * rate
        moving = true
      }
    }
    step(this.stage, this.reduce ? 1 : 0.1)
    step(this.explode, this.reduce ? 1 : 0.1)
    step(this.presence, this.reduce ? 1 : 0.16)
    step(this.yaw, 0.12)
    step(this.pitch, 0.12)
    // the pointer's lean: a few degrees, eased
    const lx = this.lean.x + (this.lean.nx * 0.07 - this.lean.x) * 0.08
    const ly = this.lean.y + (this.lean.ny * 0.04 - this.lean.y) * 0.08
    if (Math.abs(lx - this.lean.x) > 0.0002 || Math.abs(ly - this.lean.y) > 0.0002) moving = true
    this.lean.x = lx
    this.lean.y = ly

    this.root.rotation.set(this.pitch.now - this.lean.y, this.yaw.now + this.lean.x, 0)

    const s = this.stage.now
    const pres = this.presence.now
    const sketch = ease(clamp01(s)) * pres
    const wire = ease(clamp01(s - 1)) * pres
    const surface = clamp01(s - 2) * pres
    const assemble = clamp01(s - 3)
    const pencilOut = 1 - clamp01((s - 3.6) / 0.4)
    const n = this.parts.length
    const anyHl = this.highlight !== null
    // the frame is set for the parts laid out apart; once they are together
    // the model can fill it, and steps back again to make room to explode
    // (less on a narrow canvas: a phone has no width to grow into)
    const grow = this.width / this.height < 1.1 ? 0.1 : 0.38
    const zoom = 1 + grow * ease(assemble) * (1 - 0.75 * this.explode.now)
    if (Math.abs(this.camera.zoom - zoom) > 0.0005) {
      this.camera.zoom = zoom
      this.camera.updateProjectionMatrix()
    }

    this.parts.forEach((p, i) => {
      // each part's turn in the assembly: they go in one after another
      const win = n > 1 ? 0.55 : 1
      const start = n > 1 ? (i / (n - 1)) * (1 - win) : 0
      const t = clamp01((assemble - start) / win)
      const home = this.reduce ? (t > 0 ? 1 : 0) : settle(t)
      const apart = (1 - home) + this.explode.now * 0.9
      p.group.position.copy(p.out).multiplyScalar(apart)
      if (t >= 1 && !p.landed && n > 1 && !this.reduce) {
        p.landed = true
        const at = this.toScreen(p.center)
        this.events.onLand?.(at.x, at.y)
      } else if (t < 1) p.landed = false

      // picked out, or stepping back for another
      const want = this.highlight === p.key ? 1 : anyHl ? -1 : 0
      const mix = this.hlMix.get(p.key) ?? 0
      const nm = mix + (want - mix) * 0.18
      if (Math.abs(nm - mix) > 0.002) moving = true
      this.hlMix.set(p.key, nm)
      p.fill.color.copy(PAPER).lerp(DUCK, Math.max(0, nm))
      const dim = 1 - Math.max(0, -nm) * 0.6
      p.fill.opacity = surface * dim
      p.fill.depthWrite = surface > 0.95
      p.ink.opacity = dim
      p.edges.geometry.instanceCount = Math.floor(p.edgeCount * wire)
      p.pencil.geometry.instanceCount = Math.ceil(p.pencilCount * sketch)
      ;(p.pencil.material as LineMaterial).opacity = 0.28 * pencilOut * dim
      p.pencil.visible = pencilOut > 0.01
    })

    this.renderer.render(this.scene, this.camera)
    this.place()
    if (moving || this.dragging) this.kick()
  }

  private v = new THREE.Vector3()
  private toScreen(local: THREE.Vector3) {
    this.v.copy(local)
    this.model.localToWorld(this.v)
    this.v.project(this.camera)
    return { x: (this.v.x * 0.5 + 0.5) * this.width, y: (-this.v.y * 0.5 + 0.5) * this.height }
  }
  private place() {
    if (!this.events.onPlace) return
    const out: Placement[] = []
    const mid = this.toScreen(new THREE.Vector3())
    for (const p of this.parts) {
      const at = this.toScreen(p.center.clone().add(p.group.position))
      let dx = at.x - mid.x
      let dy = at.y - mid.y
      const d = Math.hypot(dx, dy) || 1
      dx /= d
      dy /= d
      if (d < 4) {
        dx = 0
        dy = -1
      }
      // the label stays on the canvas: it hangs right of a point on the
      // right, left of one on the left, so that point keeps its room
      let lx = at.x + dx * 64
      lx = lx >= at.x ? Math.min(lx, this.width - 150) : Math.max(lx, 150)
      const ly = Math.min(Math.max(at.y + dy * 64, 14), this.height - 14)
      out.push({ key: p.key, x: at.x, y: at.y, lx, ly, visible: this.stage.now > 2.5 })
    }
    // labels that would land on each other are pushed apart, top to bottom
    const order = [...out].sort((a, b) => a.ly - b.ly)
    for (let i = 1; i < order.length; i++) {
      const a = order[i - 1]
      const b = order[i]
      if (Math.abs(a.lx - b.lx) < 170 && b.ly - a.ly < 34) b.ly = a.ly + 34
    }
    this.events.onPlace(out)
  }
}

/** can this browser draw it at all? */
export function canWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}
