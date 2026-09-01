'use client'

import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { inkColors, onThemeChange } from '@/lib/theme'
import { assets } from '@/data/portfolio'

/**
 * Interactive WATER orb for the hero.
 * A custom WebGL water-surface shader lives inside the morphing glass circle:
 * moving the cursor over it drops ripples that expand, REFRACT the ASCII sky
 * beneath the surface, and catch specular glints + a Fresnel rim - so it reads
 * as real water, not paint. The orb also drifts toward the cursor.
 * Honors prefers-reduced-motion (renders a still, no ripples).
 */

const vertex = /* glsl */ `
  attribute vec2 uv;
  attribute vec2 position;
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position, 0.0, 1.0); }
`

const fragment = /* glsl */ `
  precision highp float;
  uniform vec2 uRes;
  uniform float uTime;
  uniform sampler2D uSky;
  uniform vec4 uRipples[24]; // xy=center, z=startTime, w=strength
  uniform int uCount;
  varying vec2 vUv;

  // Sum of expanding ring wavelets = the water surface height.
  float waves(vec2 uv) {
    float h = 0.0;
    for (int i = 0; i < 24; i++) {
      if (i >= uCount) break;
      vec4 r = uRipples[i];
      float age = uTime - r.z;
      if (age <= 0.0 || age > 1.8) continue;
      float dist = distance(uv, r.xy);
      float front = age * 0.65;                 // ring expands outward
      float ring = dist - front;
      // localized wavefront that decays with age + distance from the ring
      float env = exp(-age * 2.0) * exp(-ring * ring * 130.0) * r.w;
      h += sin(ring * 68.0 - age * 8.0) * env;
    }
    return h;
  }

  void main() {
    vec2 uv = vUv;
    float e = 1.3 / uRes.y;
    float h = waves(uv);
    float hx = waves(uv + vec2(e, 0.0)) - h;
    float hy = waves(uv + vec2(0.0, e)) - h;
    vec3 n = normalize(vec3(-hx * 42.0, -hy * 42.0, 1.0)); // surface normal

    // refract the sky beneath the surface
    vec2 ruv = clamp(uv + n.xy * 0.06, 0.0, 1.0);
    vec3 sky = texture2D(uSky, ruv).rgb;

    // specular glint + fresnel rim where the surface tilts
    vec3 L = normalize(vec3(0.5, 0.75, 0.9));
    float spec = pow(max(dot(n, L), 0.0), 60.0);
    float fres = pow(1.0 - n.z, 4.0);

    vec3 col = sky * 0.85 + vec3(spec) * 1.5 + vec3(fres) * 0.28;
    gl_FragColor = vec4(col, 1.0);
  }
`

export default function SkyOrb() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 90, damping: 14, mass: 0.6 })
  const sy = useSpring(my, { stiffness: 90, damping: 14, mass: 0.6 })
  const ox = useTransform(sx, (v) => v * 0.08)
  const oy = useTransform(sy, (v) => v * 0.08)

  // Orb follows the cursor a little.
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    const onMove = (e: PointerEvent) => {
      mx.set(e.clientX - window.innerWidth / 2)
      my.set(e.clientY - window.innerHeight / 2)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [mx, my])

  // Water shader.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

    let cancelled = false
    let cleanup = () => {}

    ;(async () => {
      const [{ Renderer, Program, Mesh, Triangle, Texture }, skyText] = await Promise.all([
        import('ogl'),
        fetch(assets.skyArtText)
          .then((r) => (r.ok ? r.text() : ''))
          .catch(() => ''),
      ])
      if (cancelled || !canvas) return

      // Rasterize the ASCII sky to a texture for the water to refract.
      const skyCanvas = document.createElement('canvas')
      skyCanvas.width = 480
      skyCanvas.height = 480
      const c2 = skyCanvas.getContext('2d')!
      // page and ink come from the theme tokens, so the sky inside the orb is
      // glyphs of ink on the page colour in both themes; repainted on a flip
      const paintSky = () => {
        const ink = inkColors()
        c2.fillStyle = ink.bg()
        c2.fillRect(0, 0, 480, 480)
        if (skyText) {
          const lines = skyText.replace(/\r/g, '').split('\n')
          const lh = 480 / Math.max(1, lines.length)
          c2.fillStyle = ink.fg(0.85)
          c2.textBaseline = 'top'
          c2.font = `${Math.max(3, lh * 1.2)}px monospace`
          lines.forEach((ln, i) => c2.fillText(ln, 0, i * lh))
        }
      }
      paintSky()

      let renderer
      try {
        // a 150px orb does not need four pixels per point on a phone
        renderer = new Renderer({
          canvas,
          alpha: true,
          dpr: Math.min(window.innerWidth < 768 ? 1 : 2, window.devicePixelRatio || 1),
        })
      } catch {
        return
      }
      const gl = renderer.gl
      gl.clearColor(0, 0, 0, 0)

      const texture = new Texture(gl, {
        image: skyCanvas,
        wrapS: gl.CLAMP_TO_EDGE,
        wrapT: gl.CLAMP_TO_EDGE,
      })
      const offTheme = onThemeChange(() => {
        paintSky()
        texture.needsUpdate = true
      })

      const rbuf = new Float32Array(24 * 4)
      const program = new Program(gl, {
        vertex,
        fragment,
        uniforms: {
          uTime: { value: 0 },
          uRes: { value: [1, 1] },
          uSky: { value: texture },
          uRipples: { value: rbuf },
          uCount: { value: 0 },
        },
      })
      const mesh = new Mesh(gl, { geometry: new Triangle(gl), program })

      // Measure the ORB, not the canvas. ogl's Renderer sizes the canvas to
      // its 300x150 default through inline styles in its constructor, so
      // canvas.clientWidth read that back and the sky was drawn as a
      // 300x150 strip across the middle of the bubble - since the day it
      // was built.
      const box = canvas.parentElement as HTMLElement
      const resize = () => {
        renderer.setSize(box.clientWidth, box.clientHeight)
        program.uniforms.uRes.value = [gl.canvas.width, gl.canvas.height]
      }
      resize()
      window.addEventListener('resize', resize)

      // Ripple input from the cursor over the orb.
      const t0 = performance.now() / 1000
      const ripples: { x: number; y: number; st: number; w: number }[] = []
      let lastX = 0
      let lastY = 0
      let lastT = 0
      const onMove = (e: PointerEvent) => {
        const rect = canvas.getBoundingClientRect()
        const ux = (e.clientX - rect.left) / rect.width
        const uy = 1 - (e.clientY - rect.top) / rect.height
        const t = performance.now()
        const dist = Math.hypot(ux - lastX, uy - lastY)
        if (dist < 0.028) return
        const speed = dist / Math.max(16, t - lastT)
        lastX = ux
        lastY = uy
        lastT = t
        ripples.push({ x: ux, y: uy, st: t / 1000 - t0, w: Math.min(1.3, 0.55 + speed * 45) })
        if (ripples.length > 24) ripples.shift()
      }
      canvas.addEventListener('pointermove', onMove)
      canvas.addEventListener('pointerdown', onMove)

      let raf = 0
      // the loop only draws while the orb is actually on screen: it lives in
      // the hero, and the rest of the page should not pay for it
      let onScreen = true
      const io = new IntersectionObserver(([e]) => (onScreen = e.isIntersecting), { threshold: 0 })
      io.observe(canvas)

      // a phone draws the water at 30fps: half the GPU and compositor work,
      // and the ripples read the same
      const phone = window.innerWidth < 768
      let tick = 0
      const frame = () => {
        raf = requestAnimationFrame(frame)
        if (document.hidden || !onScreen) return
        if (phone && (tick++ & 1)) return
        const now = performance.now() / 1000 - t0
        let n = 0
        for (let i = ripples.length - 1; i >= 0 && n < 24; i--) {
          const r = ripples[i]
          if (now - r.st > 1.8) continue
          rbuf[n * 4] = r.x
          rbuf[n * 4 + 1] = r.y
          rbuf[n * 4 + 2] = r.st
          rbuf[n * 4 + 3] = r.w
          n++
        }
        program.uniforms.uCount.value = n
        program.uniforms.uTime.value = reduce ? 0 : now
        renderer.render({ scene: mesh })
      }
      raf = requestAnimationFrame(frame)

      cleanup = () => {
        io.disconnect()
        offTheme()
        cancelAnimationFrame(raf)
        window.removeEventListener('resize', resize)
        canvas.removeEventListener('pointermove', onMove)
        canvas.removeEventListener('pointerdown', onMove)
        gl.getExtension('WEBGL_lose_context')?.loseContext()
      }
    })()

    return () => {
      cancelled = true
      cleanup()
    }
  }, [])

  return (
    <motion.div style={{ x: ox, y: oy }} className="my-10">
      <motion.div
        whileHover={{ scale: 1.06 }}
        transition={{ type: 'spring', stiffness: 200, damping: 18 }}
        className="liquid-orb group relative flex h-[clamp(150px,22vw,240px)] w-[clamp(150px,22vw,240px)] items-center justify-center"
      >
        {/* water surface */}
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

        {/* glass highlight over the water */}
        <div className="orb-gloss pointer-events-none absolute inset-0" />

        <span className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 font-mono text-[8px] uppercase tracking-[0.4em] text-fg-muted">
          ◇ sky
        </span>
      </motion.div>
    </motion.div>
  )
}
