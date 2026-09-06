'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import { inkColors, onThemeChange } from '@/lib/theme'
import { assets } from '@/data/portfolio'

/**
 * Interactive WATER orb for the hero.
 * A custom WebGL water-surface shader lives inside the morphing glass circle:
 * moving the cursor over it drops ripples that expand, REFRACT the portrait
 * beneath the surface (Sky's face, in the site's grey, with a faint scanline),
 * and catch specular glints + a Fresnel rim - so it reads as real water, not
 * paint. The orb also drifts toward the cursor.
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
      h += sin(ring * 44.0 - age * 7.0) * env;
    }
    return h;
  }

  void main() {
    vec2 uv = vUv;
    float e = 1.3 / uRes.y;
    float h = waves(uv);
    float hx = waves(uv + vec2(e, 0.0)) - h;
    float hy = waves(uv + vec2(0.0, e)) - h;
    // 6, not the 42 this was written with. These ripples had never once
    // rendered - the uniform below them was silently dropped - so the
    // numbers were never seen against the portrait they distort. At the
    // written strength the face disappears into corduroy; this reads as
    // water moving over a picture you can still make out.
    vec3 n = normalize(vec3(-hx * 6.0, -hy * 6.0, 1.0)); // surface normal

    // refract the sky beneath the surface
    vec2 ruv = clamp(uv + n.xy * 0.014, 0.0, 1.0);
    vec3 sky = texture2D(uSky, ruv).rgb;

    // specular glint + fresnel rim where the surface tilts
    vec3 L = normalize(vec3(0.5, 0.75, 0.9));
    float spec = pow(max(dot(n, L), 0.0), 60.0);
    float fres = pow(1.0 - n.z, 4.0);

    vec3 col = sky * 0.85 + vec3(spec) * 0.5 + vec3(fres) * 0.10;

    // The disc is cut HERE, not by CSS alone. This canvas is a square, and it
    // used to be rounded off only by the ancestor's overflow:hidden - whose
    // border-radius is animated, over a child the compositor keeps on its own
    // GPU layer. Whenever the two disagreed for a frame the square flashed
    // into view. Now there is no square to show: outside the disc the
    // fragment is transparent. Premultiplied, which is what the compositor
    // expects of a canvas.
    float d = distance(vUv, vec2(0.5));
    float a = 1.0 - smoothstep(0.5 - 1.5 / uRes.y, 0.5, d);
    gl_FragColor = vec4(col * a, a);
  }
`

export default function SkyOrb() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // bumped when a lost WebGL context is restored, to rebuild the scene
  const [epoch, setEpoch] = useState(0)
  // true while that rebuild is the reason the effect is tearing down
  const rebuilding = useRef(false)

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
      const loadPortrait = () =>
        new Promise<HTMLImageElement | null>((resolve) => {
          const img = new Image()
          img.onload = () => resolve(img)
          img.onerror = () => resolve(null)
          img.src = assets.portrait
        })
      const [{ Renderer, Program, Mesh, Triangle, Texture }, portrait] = await Promise.all([
        import('ogl'),
        loadPortrait(),
      ])
      if (cancelled || !canvas) return

      // Rasterize the portrait to a texture for the water to refract.
      const SKY_PX = 480
      const skyCanvas = document.createElement('canvas')
      skyCanvas.width = SKY_PX
      skyCanvas.height = SKY_PX
      const c2 = skyCanvas.getContext('2d')!
      // the face in the site's grey, on the page colour, with a faint
      // scanline so it belongs to the terminal; repainted on a theme flip
      // because the page colour under it changes
      const paintSky = () => {
        const ink = inkColors()
        c2.fillStyle = ink.bg()
        c2.fillRect(0, 0, SKY_PX, SKY_PX)
        if (!portrait) return
        // cover the square, framed on the face (the upper part of the shot)
        const k = Math.max(SKY_PX / portrait.width, SKY_PX / portrait.height)
        const w = portrait.width * k
        const h = portrait.height * k
        c2.drawImage(portrait, (SKY_PX - w) / 2, -(h - SKY_PX) * 0.12, w, h)
        const px = c2.getImageData(0, 0, SKY_PX, SKY_PX)
        const d = px.data
        const light = document.documentElement.dataset.theme === 'light'
        for (let i = 0; i < d.length; i += 4) {
          let g = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]
          // a touch more contrast, and a scanline every third row
          g = 128 + (g - 128) * 1.15
          if (((i >> 2) / SKY_PX) % 3 < 1) g *= light ? 1.06 : 0.86
          const v = Math.max(0, Math.min(255, g))
          d[i] = d[i + 1] = d[i + 2] = v
        }
        c2.putImageData(px, 0, 0)
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

      // a plain array, not a Float32Array: ogl decides an array uniform is
      // supplied with Array.isArray(value), so a typed array made it warn
      // "Active uniform uRipples[0] has not been supplied" every frame -
      // hundreds of console warnings a second, and the ripples never drew
      const rbuf: number[] = new Array(24 * 4).fill(0)
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
        if (dist < 0.045) return
        const speed = dist / Math.max(16, t - lastT)
        lastX = ux
        lastY = uy
        lastT = t
        ripples.push({ x: ux, y: uy, st: t / 1000 - t0, w: Math.min(0.5, 0.22 + speed * 20) })
        if (ripples.length > 24) ripples.shift()
      }
      canvas.addEventListener('pointermove', onMove)
      canvas.addEventListener('pointerdown', onMove)

      // A driver can take the context away at any time - a GPU switch, a
      // suspend, another tab's context budget - and this machine drives two
      // of them. Unhandled, the canvas stays blank for good; the default
      // action must be prevented for the browser to offer it back at all.
      const onLost = (e: Event) => {
        e.preventDefault()
        cancelAnimationFrame(raf)
      }
      const onRestored = () => {
        rebuilding.current = true // see the teardown below
        setEpoch((n) => n + 1) // rebuild everything against the new context
      }
      canvas.addEventListener('webglcontextlost', onLost)
      canvas.addEventListener('webglcontextrestored', onRestored)

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
        // before loseContext below, or our own teardown would look like a
        // driver taking the context away and rebuild the orb forever
        canvas.removeEventListener('webglcontextlost', onLost)
        canvas.removeEventListener('webglcontextrestored', onRestored)
        // Dropping the context is for leaving the page. After a restore it
        // would throw away the context we were just handed - a canvas only
        // ever has the one - and the rebuilt orb would draw into a dead
        // context and never show anything again.
        if (rebuilding.current) rebuilding.current = false
        else gl.getExtension('WEBGL_lose_context')?.loseContext()
      }
    })()

    return () => {
      cancelled = true
      cleanup()
    }
  }, [epoch])

  return (
    <motion.div style={{ x: ox, y: oy }} className="my-10">
      <motion.div
        whileHover={{ scale: 1.06 }}
        transition={{ type: 'spring', stiffness: 200, damping: 18 }}
        data-cursor-label="ripple"
        className="liquid-orb group relative flex h-[clamp(9.375rem,22vw,15rem)] w-[clamp(9.375rem,22vw,15rem)] items-center justify-center"
      >
        {/* water surface */}
        {/* orb-canvas carries the same morph: an element's own border-radius
            clips its own layer, which an ancestor's cannot be relied on to */}
        <canvas ref={canvasRef} className="orb-canvas absolute inset-0 h-full w-full" />

        {/* glass highlight over the water */}
        <div className="orb-gloss pointer-events-none absolute inset-0" />

        <span className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 font-mono text-[0.5rem] uppercase tracking-[0.4em] text-fg-muted">
          ◇ sky
        </span>
      </motion.div>
    </motion.div>
  )
}
