'use client'

import Image from 'next/image'
import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react'

/**
 * The ZaruTech duck, Sky's mascot. One drawing so far, split into layers in
 * public/duck (see assets/duck for the source): a dark composite for the
 * dark theme and a light one for paper, swapped by CSS on data-theme so no
 * script has to know which is on.
 *
 * `pose` is what the site does with that one drawing until more are drawn:
 *
 *   hero     full, leaning in, parallaxes against the pointer
 *   podium   mirrored and tilted, as if leaning on the certificate podium
 *   laptop   cropped to the chest, for behind the ASCII laptop on the filmstrip
 *   peace    mirrored, for the ending
 *   peek     the head only, over a section edge
 *   sleep    on its side, for the 404
 *
 * When a real drawing for a pose lands in public/duck/duck-<pose>-{dark,light}.png,
 * point that pose's `src` at it here and drop its transform.
 */
export type DuckPose = 'hero' | 'podium' | 'laptop' | 'peace' | 'peek' | 'sleep'

const POSE: Record<DuckPose, { src: string; className: string; clip?: string }> = {
  // no mirroring anywhere: the chest says ZaruTech and a mirror flips it
  hero: { src: 'duck', className: '-rotate-3' },
  podium: { src: 'duck', className: 'rotate-6' },
  laptop: { src: 'duck', className: '', clip: 'inset(0 0 42% 0)' },
  peace: { src: 'duck', className: 'rotate-2' },
  peek: { src: 'duck-head', className: '' },
  sleep: { src: 'duck-head', className: '-rotate-[70deg] opacity-80' },
}

// intrinsic sizes of the PNGs in public/duck (both themes share a size)
const SIZE: Record<string, { w: number; h: number }> = {
  duck: { w: 540, h: 1015 },
  'duck-head': { w: 560, h: 560 },
}

export default function Duck({
  pose = 'hero',
  width = 300,
  parallax = 0,
  priority = false,
  className = '',
}: {
  pose?: DuckPose
  /** rendered width in px; height follows the drawing */
  width?: number
  /** how far, in px, the duck drifts against the pointer; 0 = still */
  parallax?: number
  priority?: boolean
  className?: string
}) {
  const p = POSE[pose]
  const size = SIZE[p.src]
  const reduce = useReducedMotion()

  // pointer parallax: the duck leans a few px away from the cursor, on a
  // spring so it settles rather than snaps. Desktop pointers only; a touch
  // screen has no hover and the listener never fires.
  const px = useMotionValue(0)
  const py = useMotionValue(0)
  const sx = useSpring(px, { stiffness: 60, damping: 14 })
  const sy = useSpring(py, { stiffness: 60, damping: 14 })
  const x = useTransform(sx, (v) => v * parallax)
  const y = useTransform(sy, (v) => v * parallax)
  const active = useRef(false)

  useEffect(() => {
    if (!parallax || reduce) return
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    const onMove = (e: PointerEvent) => {
      active.current = true
      px.set(-(e.clientX / window.innerWidth - 0.5) * 2)
      py.set(-(e.clientY / window.innerHeight - 0.5) * 2)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [parallax, reduce, px, py])

  const img = (theme: 'dark' | 'light') => (
    <Image
      src={`/duck/${p.src}-${theme}.png`}
      alt=""
      width={size.w}
      height={size.h}
      priority={priority}
      draggable={false}
      sizes={`${width}px`}
      className={`duck-${theme} h-auto w-full select-none`}
      style={{ clipPath: p.clip }}
    />
  )

  return (
    <motion.div
      aria-hidden
      style={{ width, x, y }}
      className={`pointer-events-none relative shrink-0 ${p.className} ${className}`}
    >
      {/* both themes are in the tree; globals.css shows one per data-theme */}
      {img('dark')}
      {img('light')}
    </motion.div>
  )
}
