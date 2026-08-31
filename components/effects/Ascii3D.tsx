'use client'

import { useEffect, useRef } from 'react'
import { currentTheme, inkColors, onThemeChange } from '@/lib/theme'

/**
 * ASCII 3D - a real Three.js torus knot drawn AS CHARACTERS, floating behind
 * the About content. Auto-rotates and eases toward the cursor. Section-scoped
 * background layer (absolute, not fixed) so it scrolls with its section.
 *
 * Its own asciifier, not three's AsciiEffect addon. The addon renders the
 * scene at the full section size, copies it to a 2D canvas, reads that back,
 * builds an HTML string and rewrites a <table> with innerHTML - every frame.
 * At 60fps that was the whole main thread, and everything beside it (the
 * terminal typing) stalled. This renders at the character grid's size - one
 * pixel per cell, ~18k pixels instead of 1.6M - reads them straight out of
 * WebGL, and sets one text node. It also maps the transparent background to a
 * space, which the addon did not: that was the "scanline" hatching, and the
 * reason the light theme had to dim this layer.
 *
 * Perf/safety (site conventions):
 *  - three is lazy-imported, and only once the section is on screen.
 *  - Loop only runs while on-screen and the tab is visible; reduced-motion
 *    renders one static frame.
 *  - Full cleanup on unmount (rAF, listeners, DOM, GPU resources).
 */

// ---- dials -----------------------------------------------------------------
const CHARSET = ' .:-+*=%@#' // dark → bright; index 0 is a space, so the void stays empty
const MAX_COLS = 220 // cells across at the widest; ~18k cells on a 1600x1000 host
const MIN_FONT = 5 // px, desktop: ~18k cells on a 1600x1000 host
// the About section is much taller than a phone screen, so 5px cells there
// meant 35k of them - twice the desktop count on a quarter of the CPU
const MIN_FONT_PHONE = 10 // ~9k cells
const GLYPH_W = 0.6 // JetBrains Mono advance width as a share of font-size
const OPACITY = 0.55 // ink alpha on the dark theme
const OPACITY_LIGHT = 0.4 // no hatching now, so the light theme can afford more
const SPIN_X = 0.004 // auto-rotation per frame
const SPIN_Y = 0.006
const FOLLOW = 0.6 // how far the knot tilts toward the cursor (radians-ish)
const EASE = 0.04 // lerp factor toward the cursor target
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

      // --- scene -------------------------------------------------------------
      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100)
      camera.position.z = 4
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
      const pre = document.createElement('pre')
      pre.setAttribute('aria-hidden', 'true')
      pre.style.cssText =
        'margin:0;position:absolute;inset:0;overflow:hidden;white-space:pre;font-family:var(--font-mono),ui-monospace,monospace;'
      host.appendChild(pre)

      let cols = 0
      let rows = 0
      let pixels = new Uint8Array(0)
      const lines: string[] = []

      const size = () => {
        const w = Math.max(1, host.clientWidth)
        const h = Math.max(1, host.clientHeight)
        // as many cells across as fit at MIN_FONT, capped: one pixel per cell
        const minFont = w < 768 ? MIN_FONT_PHONE : MIN_FONT
        cols = Math.max(20, Math.min(MAX_COLS, Math.floor(w / (minFont * GLYPH_W))))
        const font = w / cols / GLYPH_W
        rows = Math.max(10, Math.floor(h / font))
        pre.style.fontSize = `${font}px`
        pre.style.lineHeight = `${h / rows}px`
        camera.aspect = w / h // the picture keeps the host's aspect...
        camera.updateProjectionMatrix()
        renderer.setSize(cols, rows, false) // ...the buffer is the cell grid
        pixels = new Uint8Array(cols * rows * 4)
      }
      size()
      window.addEventListener('resize', size)

      const paint = () =>
        (pre.style.color = inkColors().fg(currentTheme() === 'light' ? OPACITY_LIGHT : OPACITY))
      paint()
      const offTheme = onThemeChange(paint)

      // read the frame back and map each pixel to a glyph; WebGL rows come
      // bottom-up, so walk them in reverse. Transparent background reads as
      // 0 luminance → charset[0], a space.
      const asciify = () => {
        gl.readPixels(0, 0, cols, rows, gl.RGBA, gl.UNSIGNED_BYTE, pixels)
        lines.length = 0
        const top = CHARSET.length - 1
        for (let y = rows - 1; y >= 0; y--) {
          let line = ''
          const row = y * cols * 4
          for (let x = 0; x < cols; x++) {
            const i = row + x * 4
            // luminance, premultiplied by alpha so the void stays dark
            const lum =
              ((0.2126 * pixels[i] + 0.7152 * pixels[i + 1] + 0.0722 * pixels[i + 2]) *
                pixels[i + 3]) /
              65025
            line += CHARSET[Math.min(top, (lum * CHARSET.length) | 0)]
          }
          lines.push(line)
        }
        pre.textContent = lines.join('\n')
      }

      // --- cursor target (same lerp pattern as SkyOrb) -------------------------
      const target = { x: 0, y: 0 }
      const onMove = (e: PointerEvent) => {
        target.y = (e.clientX / window.innerWidth - 0.5) * 2 * FOLLOW
        target.x = (e.clientY / window.innerHeight - 0.5) * 2 * FOLLOW
      }
      if (!reduce) window.addEventListener('pointermove', onMove, { passive: true })

      // --- loop gated by visibility --------------------------------------------
      let raf = 0
      let onScreen = true
      const io = new IntersectionObserver(
        (entries) => entries.forEach((e) => (onScreen = e.isIntersecting)),
        { threshold: 0 },
      )
      io.observe(host)

      const tilt = { x: 0, y: 0 }
      const frame = () => {
        raf = requestAnimationFrame(frame)
        if (!onScreen || document.hidden) return
        mesh.rotation.x += SPIN_X
        mesh.rotation.y += SPIN_Y
        tilt.x += (target.x - tilt.x) * EASE
        tilt.y += (target.y - tilt.y) * EASE
        scene.rotation.x = tilt.x
        scene.rotation.y = tilt.y
        orbitLight.position.x = Math.sin(mesh.rotation.y) * 4
        orbitLight.position.z = Math.cos(mesh.rotation.y) * 4
        renderer.render(scene, camera)
        asciify()
      }

      if (reduce) {
        mesh.rotation.set(0.6, 0.9, 0)
        renderer.render(scene, camera)
        asciify() // one static frame
      } else {
        raf = requestAnimationFrame(frame)
      }

      cleanup = () => {
        cancelAnimationFrame(raf)
        io.disconnect()
        offTheme()
        window.removeEventListener('resize', size)
        window.removeEventListener('pointermove', onMove)
        pre.remove()
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
