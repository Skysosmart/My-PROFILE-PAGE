'use client'

import { useEffect, useRef } from 'react'
import { inkColors } from '@/lib/ink'
import { onLean } from '@/lib/lean'

/**
 * ASCII 3D - a real Three.js torus knot drawn AS CHARACTERS, floating behind
 * the About content. Auto-rotates and eases toward the cursor (or the tilt
 * of a phone). Section-scoped
 * background layer (absolute, not fixed) so it scrolls with its section.
 *
 * Its own asciifier, not three's AsciiEffect addon. The scene renders at the
 * character grid's size - one pixel per cell, ~18k pixels instead of 1.6M -
 * and is read straight back out of WebGL. Each row of cells becomes a string
 * that is drawn onto a 2D canvas with one fillText, in the site's mono font
 * at the cell size, in the ink colour; only the rows that changed since the
 * last frame are redrawn. Transparent background maps to charset[0], a
 * space, so the void stays empty.
 *
 * It used to set the text of one <pre> instead: 18k characters of DOM text,
 * re-laid-out and re-rasterised sixty times a second. That was half the main
 * thread in About - and in the top of Education too, where the section's
 * bottom edge was still on screen. A canvas has no layout, and drawing a row
 * is one call, not one per glyph (an atlas with a drawImage per cell was
 * tried first: thousands of tiny draws a frame cost more than the layout).
 *
 * Perf/safety (site conventions):
 *  - three is lazy-imported, and only once the section is on screen.
 *  - The pixels are read back asynchronously (a pixel pack buffer and a
 *    fence, WebGL2): a readPixels straight after the render made the main
 *    thread wait for the frame to finish - 3 ms of every frame on a software
 *    renderer. The picture runs one frame behind the scene, which no one
 *    can see.
 *  - The loop only runs while the band the knot can occupy is on screen and
 *    the tab is visible; parked, it is not even scheduled. The last frame
 *    stays painted. Reduced-motion renders one static frame.
 *  - Full cleanup on unmount (rAF, observers, listeners, DOM, GPU resources).
 */

// ---- dials -----------------------------------------------------------------
const CHARSET = ' .:-+*=%@#' // dark → bright; index 0 is a space, so the void stays empty
const MAX_COLS = 220 // cells across at the widest; ~18k cells on a 1600x1000 host
const MIN_FONT = 5 // px, desktop: ~18k cells on a 1600x1000 host
// the About section is much taller than a phone screen, so 5px cells there
// meant 35k of them - twice the desktop count on a quarter of the CPU
const MIN_FONT_PHONE = 10 // ~9k cells
const GLYPH_W = 0.6 // JetBrains Mono advance width as a share of font-size
const OPACITY = 0.4 // ink alpha; no hatching, so the paper can afford this much
const OPACITY_PHONE = 0.32 // it sits behind the text there, not beside it
const CAMERA_Z = 4
const CAMERA_Z_PHONE = 5.6 // a smaller knot on a screen it would otherwise fill
const SPIN_X = 0.004 // auto-rotation per frame
const SPIN_Y = 0.006
const FOLLOW = 0.6 // how far the knot tilts toward the cursor (radians-ish)
const EASE = 0.04 // lerp factor toward the cursor target
// the knot never reaches the outer strips of the section; while only one of
// those is on screen the loop parks and the last frame stays
const EDGE = 0.08
const MAX_DPR = 2 // the picture is glyphs a few px tall: 2x is already crisp
// -----------------------------------------------------------------------------

export default function Ascii3D() {
  const hostRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    let cancelled = false
    let cleanup = () => {}

    ;(async () => {
      // nothing - not even the download - until the section is on screen
      await new Promise<void>((resolve) => {
        const gate = new IntersectionObserver(
          ([e]) => {
            if (e.isIntersecting) {
              gate.disconnect()
              resolve()
            }
          },
          { threshold: 0.05 },
        )
        gate.observe(host)
        cleanup = () => gate.disconnect()
      })
      if (cancelled) return

      const THREE = await import('three')
      if (cancelled) return

      const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
      const phone = () => window.innerWidth < 768

      // --- scene -------------------------------------------------------------
      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100)
      camera.position.z = phone() ? CAMERA_Z_PHONE : CAMERA_Z
      const geometry = new THREE.TorusKnotGeometry(1, 0.32, 160, 24)
      const material = new THREE.MeshPhongMaterial({ flatShading: true })
      const mesh = new THREE.Mesh(geometry, material)
      scene.add(mesh)
      const keyLight = new THREE.PointLight(0xffffff, 400)
      keyLight.position.set(4, 4, 4)
      scene.add(keyLight)
      const orbitLight = new THREE.PointLight(0xffffff, 150)
      orbitLight.position.set(-4, -2, 3)
      scene.add(orbitLight)

      // --- renderer: the drawing buffer IS the character grid -----------------
      let renderer: InstanceType<typeof THREE.WebGLRenderer>
      try {
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
      } catch {
        return // no WebGL → no layer; content is unaffected
      }
      const gl = renderer.getContext()

      // --- the picture: a 2D canvas the glyphs are drawn onto -----------------
      const cv = document.createElement('canvas')
      cv.setAttribute('aria-hidden', 'true')
      cv.style.cssText =
        'position:absolute;inset:0;width:100%;height:100%;font-family:var(--font-mono),ui-monospace,monospace;'
      const ctx = cv.getContext('2d')
      if (!ctx) {
        renderer.dispose()
        return
      }
      host.appendChild(cv)
      // the resolved family list: ctx.font cannot read a CSS variable
      const family = getComputedStyle(cv).fontFamily || 'monospace'

      // the band the knot can occupy; the loop runs while any of it is on screen
      const band = document.createElement('div')
      band.style.cssText = `position:absolute;left:0;right:0;top:${EDGE * 100}%;bottom:${EDGE * 100}%;pointer-events:none;`
      host.appendChild(band)

      let cols = 0
      let rows = 0
      let ch = 0 // a row, in device pixels
      let base = 0 // the text baseline within a row
      let pixels = new Uint8Array(0)
      const lines: string[] = [] // the current frame, one string per row
      const drawn: string[] = [] // what is on the canvas, per row

      const ink = () => inkColors().fg(phone() ? OPACITY_PHONE : OPACITY)

      // the pen: the mono font at the cell size, the ink colour, and the
      // baseline that centres a glyph in its row the way a line box does.
      // Sizing the canvas resets all of this, so it is set after each size.
      const setPen = () => {
        const px = (cv.width / cols) / GLYPH_W
        ctx.font = `${px}px ${family}`
        ctx.fillStyle = ink()
        ctx.textAlign = 'left'
        ctx.textBaseline = 'alphabetic'
        // no kerning or ligatures: this is a grid of cells, and shaping
        // 18k glyphs a frame is work for nothing
        if ('fontKerning' in ctx) ctx.fontKerning = 'none'
        if ('textRendering' in ctx) ctx.textRendering = 'optimizeSpeed'
        const m = ctx.measureText('@')
        const asc = m.fontBoundingBoxAscent ?? px * 0.8
        const desc = m.fontBoundingBoxDescent ?? px * 0.2
        base = ch / 2 + (asc - desc) / 2
        drawn.length = 0 // everything must be drawn again
      }

      // put the rows that changed onto the canvas
      const blit = () => {
        for (let r = 0; r < rows; r++) {
          const line = lines[r]
          if (line === drawn[r]) continue
          const y0 = Math.round(r * ch)
          ctx.clearRect(0, y0, cv.width, Math.round((r + 1) * ch) - y0)
          if (line.trim()) ctx.fillText(line, 0, y0 + base)
          drawn[r] = line
        }
      }

      // --- readback -----------------------------------------------------------
      // where WebGL2 allows it, the pixels of a frame are requested into a
      // buffer after its render and taken one frame later, once the fence
      // says they are in - the main thread never waits for the renderer
      const gl2 = 'fenceSync' in gl ? (gl as WebGL2RenderingContext) : null
      const pbo = gl2?.createBuffer() ?? null
      let fence: WebGLSync | null = null
      const dropFence = () => {
        if (gl2 && fence) gl2.deleteSync(fence)
        fence = null
      }
      const request = () => {
        if (!gl2 || !pbo) return
        gl2.bindBuffer(gl2.PIXEL_PACK_BUFFER, pbo)
        gl2.readPixels(0, 0, cols, rows, gl2.RGBA, gl2.UNSIGNED_BYTE, 0)
        gl2.bindBuffer(gl2.PIXEL_PACK_BUFFER, null)
        dropFence()
        fence = gl2.fenceSync(gl2.SYNC_GPU_COMMANDS_COMPLETE, 0)
        gl2.flush()
      }
      const collect = () => {
        if (!gl2 || !pbo || !fence) return false
        if (gl2.clientWaitSync(fence, 0, 0) === gl2.TIMEOUT_EXPIRED) return false
        dropFence()
        gl2.bindBuffer(gl2.PIXEL_PACK_BUFFER, pbo)
        gl2.getBufferSubData(gl2.PIXEL_PACK_BUFFER, 0, pixels)
        gl2.bindBuffer(gl2.PIXEL_PACK_BUFFER, null)
        return true
      }
      // the one-off, waiting, way: a resize, a static frame
      const readNow = () => gl.readPixels(0, 0, cols, rows, gl.RGBA, gl.UNSIGNED_BYTE, pixels)

      // map each pixel of the last read to a glyph; WebGL rows come bottom-up,
      // so walk them in reverse. Transparent background reads as 0 luminance
      // → charset[0], a space.
      const asciify = () => {
        const top = CHARSET.length - 1
        for (let r = 0; r < rows; r++) {
          const src = (rows - 1 - r) * cols * 4
          let line = ''
          for (let c = 0; c < cols; c++) {
            const i = src + c * 4
            // luminance, premultiplied by alpha so the void stays dark
            const lum =
              ((0.2126 * pixels[i] + 0.7152 * pixels[i + 1] + 0.0722 * pixels[i + 2]) *
                pixels[i + 3]) /
              65025
            line += CHARSET[Math.min(top, (lum * CHARSET.length) | 0)]
          }
          lines[r] = line
        }
        blit()
      }

      const size = () => {
        const w = Math.max(1, host.clientWidth)
        const h = Math.max(1, host.clientHeight)
        // as many cells across as fit at MIN_FONT, capped: one pixel per cell
        const minFont = w < 768 ? MIN_FONT_PHONE : MIN_FONT
        cols = Math.max(20, Math.min(MAX_COLS, Math.floor(w / (minFont * GLYPH_W))))
        const font = w / cols / GLYPH_W
        rows = Math.max(10, Math.floor(h / font))
        const dpr = Math.min(MAX_DPR, window.devicePixelRatio || 1)
        cv.width = Math.round(w * dpr)
        cv.height = Math.round(h * dpr)
        ch = cv.height / rows
        camera.aspect = w / h // the picture keeps the host's aspect...
        camera.updateProjectionMatrix()
        renderer.setSize(cols, rows, false) // ...the buffer is the cell grid
        pixels = new Uint8Array(cols * rows * 4)
        if (gl2 && pbo) {
          dropFence() // whatever was in flight was the old grid
          gl2.bindBuffer(gl2.PIXEL_PACK_BUFFER, pbo)
          gl2.bufferData(gl2.PIXEL_PACK_BUFFER, pixels.byteLength, gl2.STREAM_READ)
          gl2.bindBuffer(gl2.PIXEL_PACK_BUFFER, null)
        }
        lines.length = 0
        setPen()
      }
      const renderOnce = () => {
        renderer.render(scene, camera)
        readNow()
        asciify()
      }
      size()
      const onResize = () => {
        size()
        renderOnce()
      }
      window.addEventListener('resize', onResize)

      // the same frame again, with a fresh pen (a new ink, or the font in)
      const repaint = () => {
        setPen()
        ctx.clearRect(0, 0, cv.width, cv.height)
        if (lines.length) blit()
      }
      // the mono font is normally in by now (the header uses it); if not, the
      // picture is redrawn once it lands
      document.fonts?.ready.then(() => {
        if (!cancelled) repaint()
      })

      // --- the tilt target: the pointer, or the phone's tilt (lib/lean.ts) ---
      const target = { x: 0, y: 0 }
      const offLean = reduce
        ? () => {}
        : onLean(({ x, y }) => {
            target.y = x * FOLLOW
            target.x = y * FOLLOW
          })

      // --- loop, parked whenever the knot's band is off screen -----------------
      let raf = 0
      let onScreen = false
      const tilt = { x: 0, y: 0 }
      const frame = () => {
        raf = 0
        if (!onScreen || document.hidden) return // parked; an observer restarts it
        mesh.rotation.x += SPIN_X
        mesh.rotation.y += SPIN_Y
        tilt.x += (target.x - tilt.x) * EASE
        tilt.y += (target.y - tilt.y) * EASE
        scene.rotation.x = tilt.x
        scene.rotation.y = tilt.y
        orbitLight.position.x = Math.sin(mesh.rotation.y) * 4
        orbitLight.position.z = Math.cos(mesh.rotation.y) * 4
        if (gl2 && pbo) {
          if (collect()) asciify() // the previous frame, now that it is in
          renderer.render(scene, camera)
          request()
        } else {
          renderOnce()
        }
        raf = requestAnimationFrame(frame)
      }
      const wake = () => {
        if (reduce || raf || !onScreen || document.hidden) return
        raf = requestAnimationFrame(frame)
      }
      const io = new IntersectionObserver(
        ([e]) => {
          onScreen = e.isIntersecting
          wake()
        },
        { threshold: 0 },
      )
      io.observe(band)
      document.addEventListener('visibilitychange', wake)

      if (reduce) {
        mesh.rotation.set(0.6, 0.9, 0)
        renderOnce() // one static frame
      }

      cleanup = () => {
        if (raf) cancelAnimationFrame(raf)
        raf = 0
        io.disconnect()
        document.removeEventListener('visibilitychange', wake)
        window.removeEventListener('resize', onResize)
        offLean()
        cv.remove()
        band.remove()
        dropFence()
        if (gl2 && pbo) gl2.deleteBuffer(pbo)
        geometry.dispose()
        material.dispose()
        renderer.dispose()
      }
    })()

    return () => {
      cancelled = true
      cleanup()
    }
  }, [])

  return (
    <div
      ref={hostRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    />
  )
}
