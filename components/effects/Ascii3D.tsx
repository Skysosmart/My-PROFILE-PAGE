'use client'

import { useEffect, useRef } from 'react'
import { currentTheme, inkColors, onThemeChange } from '@/lib/theme'

/**
 * ASCII 3D - a real Three.js torus knot rendered AS ASCII CHARACTERS
 * (three's AsciiEffect addon), floating behind the About content.
 * Auto-rotates and eases toward the cursor. Section-scoped background layer
 * (absolute, not fixed) so it scrolls with its section.
 *
 * Perf/safety (site conventions):
 *  - three is lazy-imported so it lives in its own chunk.
 *  - Loop only runs while the section is on-screen (IntersectionObserver)
 *    and the tab is visible; prefers-reduced-motion renders one static frame.
 *  - Full cleanup on unmount (rAF, listeners, DOM node, GPU resources).
 */

// ---- dials -----------------------------------------------------------------
const CHARSET = ' .:-+*=%@#' // dark → bright
const RESOLUTION = 0.2 // AsciiEffect char density (higher = finer)
const RESOLUTION_PHONE = 0.15
// Every frame the effect renders, reads the pixels back, builds a string of
// tens of thousands of characters and rewrites a table. At 60fps that is the
// main thread, and everything beside it - the terminal typing - stalls.
// A torus turning at 30fps looks the same; a phone gets 15.
const FPS = 30
const FPS_PHONE = 15
const OPACITY = 0.55 // layer opacity on the dark theme
const OPACITY_LIGHT = 0.16 // dark ink in every cell reads as hatching; keep it faint
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
      // Nothing - not even the three.js download - until the section is
      // actually on screen. About sits right at the fold on a phone, so it
      // mounts the moment the boot ends; without this gate the hero paid for
      // a WebGL context and a 600KB library it could not see yet.
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

      const [THREE, { AsciiEffect }] = await Promise.all([
        import('three'),
        import('three/examples/jsm/effects/AsciiEffect.js'),
      ])
      if (cancelled || !host) return

      const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
      const phone = window.innerWidth < 768

      // --- scene -------------------------------------------------------------
      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(
        55,
        Math.max(1, host.clientWidth) / Math.max(1, host.clientHeight),
        0.1,
        100,
      )
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

      // --- renderer → ASCII ----------------------------------------------------
      let renderer: InstanceType<typeof THREE.WebGLRenderer>
      try {
        renderer = new THREE.WebGLRenderer({ alpha: true })
      } catch {
        return // no WebGL → no layer; content is unaffected
      }
      const effect = new AsciiEffect(renderer, CHARSET, {
        invert: true,
        resolution: phone ? RESOLUTION_PHONE : RESOLUTION,
      })
      effect.setSize(Math.max(1, host.clientWidth), Math.max(1, host.clientHeight))
      const dom = effect.domElement
      // the ink is a theme token, so read it rather than assume white, and
      // repaint when the theme flips
      const paint = () =>
        (dom.style.color = inkColors().fg(currentTheme() === 'light' ? OPACITY_LIGHT : OPACITY))
      paint()
      const offTheme = onThemeChange(paint)
      dom.style.backgroundColor = 'transparent'
      host.appendChild(dom)

      const resize = () => {
        const w = Math.max(1, host.clientWidth)
        const h = Math.max(1, host.clientHeight)
        camera.aspect = w / h
        camera.updateProjectionMatrix()
        effect.setSize(w, h)
      }
      window.addEventListener('resize', resize)

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

      const tilt = { x: 0, y: 0 } // eased cursor-follow offset
      const interval = 1000 / (phone ? FPS_PHONE : FPS)
      let last = 0
      const frame = (now: number) => {
        raf = requestAnimationFrame(frame)
        if (!onScreen || document.hidden) return
        if (now - last < interval) return
        last = now
        mesh.rotation.x += SPIN_X
        mesh.rotation.y += SPIN_Y
        tilt.x += (target.x - tilt.x) * EASE
        tilt.y += (target.y - tilt.y) * EASE
        scene.rotation.x = tilt.x
        scene.rotation.y = tilt.y
        orbitLight.position.x = Math.sin(mesh.rotation.y) * 4
        orbitLight.position.z = Math.cos(mesh.rotation.y) * 4
        effect.render(scene, camera)
      }

      if (reduce) {
        mesh.rotation.set(0.6, 0.9, 0)
        effect.render(scene, camera) // one static frame
      } else {
        raf = requestAnimationFrame(frame)
      }

      cleanup = () => {
        cancelAnimationFrame(raf)
        io.disconnect()
        window.removeEventListener('resize', resize)
        window.removeEventListener('pointermove', onMove)
        offTheme()
        dom.remove()
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
      className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center overflow-hidden"
    />
  )
}
