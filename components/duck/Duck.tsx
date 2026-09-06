'use client'

import Image from 'next/image'
import { useEffect } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react'

/**
 * The ZaruTech duck, Sky's mascot. Each pose is its own drawing (the sources
 * are in assets/duck), split by scripts/duck-split.sh into a dark and a
 * light composite in public/duck. The two are both in the tree and
 * globals.css shows one per data-theme, so no script has to know which
 * theme is on and the drawing is right on the first paint.
 *
 *   hero     waving hi, beside the orb
 *   podium   holding the trophy, by the certificate podium
 *   laptop   typing, at the head of the project filmstrip
 *   thumbs   thumbs up, at the ending
 *   stand    the original, hand on hip
 *   sleep    asleep under the ZaruTech blanket, on the 404
 *   hacker   hacker mode at the TUF laptop, with the writeups (a cutout,
 *            it carries its own scene)
 */
export type DuckPose = 'hero' | 'podium' | 'laptop' | 'thumbs' | 'stand' | 'sleep' | 'hacker'

// file stem and intrinsic size of the composites (the script prints them)
const POSE: Record<DuckPose, { src: string; w: number; h: number; className?: string }> = {
  hero: { src: 'wave', w: 630, h: 1007, className: '-rotate-2' },
  podium: { src: 'trophy', w: 702, h: 1012, className: 'rotate-3' },
  laptop: { src: 'laptop', w: 718, h: 1005 },
  thumbs: { src: 'thumbs', w: 601, h: 1002, className: 'rotate-2' },
  stand: { src: 'stand', w: 540, h: 1015, className: '-rotate-3' },
  sleep: { src: 'sleep', w: 1097, h: 631 },
  hacker: { src: 'hacker', w: 1100, h: 1040 },
}

export default function Duck({
  pose = 'stand',
  width = 300,
  parallax = 0,
  priority = false,
  className = '',
}: {
  pose?: DuckPose
  /** rendered width in px; the height follows the drawing */
  width?: number
  /** how far, in px, the duck drifts against the pointer; 0 = still */
  parallax?: number
  priority?: boolean
  className?: string
}) {
  const p = POSE[pose]
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

  useEffect(() => {
    if (!parallax || reduce) return
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    const onMove = (e: PointerEvent) => {
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
      width={p.w}
      height={p.h}
      priority={priority}
      draggable={false}
      sizes={`${width}px`}
      className={`duck-${theme} h-auto w-full select-none`}
    />
  )

  return (
    <motion.div
      aria-hidden
      style={{ width, x, y }}
      className={`pointer-events-none relative shrink-0 ${p.className ?? ''} ${className}`}
    >
      {/* both themes are in the tree; globals.css shows one per data-theme */}
      {img('dark')}
      {img('light')}
    </motion.div>
  )
}
