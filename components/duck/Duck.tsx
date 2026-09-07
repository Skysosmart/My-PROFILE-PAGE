'use client'

import Image from 'next/image'
import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react'
import { onLean } from '@/lib/lean'

/**
 * The ZaruTech duck, Sky's mascot. Each pose is its own drawing (the sources
 * are in assets/duck), turned into the composite in public/duck by
 * scripts/duck-split.sh. The `-light` in the file names is left over from
 * when the site had two themes and shipped a drawing for each.
 *
 *   hero     saying hello, at the left of the hero
 *   wave     the plain wave, kept for later
 *   podium   holding the trophy, by the certificate podium
 *   laptop   typing, at the head of the project filmstrip
 *   thumbs   thumbs up, at the ending
 *   stand    the original, hand on hip
 *   sleep    asleep under the ZaruTech blanket, on the 404
 *   hacker   hacker mode at the TUF laptop, with the writeups (a cutout,
 *            it carries its own scene)
 */
export type DuckPose = 'hero' | 'wave' | 'podium' | 'laptop' | 'thumbs' | 'stand' | 'sleep' | 'hacker'

// file stem and intrinsic size of the composites (the script prints them)
const POSE: Record<DuckPose, { src: string; w: number; h: number; className?: string }> = {
  hero: { src: 'hello', w: 701, h: 1006 },
  wave: { src: 'wave', w: 626, h: 1004, className: '-rotate-2' },
  podium: { src: 'trophy', w: 764, h: 1008, className: 'rotate-3' },
  laptop: { src: 'laptop', w: 715, h: 1003 },
  thumbs: { src: 'thumbs', w: 597, h: 999, className: 'rotate-2' },
  stand: { src: 'stand', w: 538, h: 1012, className: '-rotate-3' },
  sleep: { src: 'sleep', w: 1094, h: 628 },
  hacker: { src: 'hacker', w: 1094, h: 1034 },
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
  const ref = useRef<HTMLDivElement>(null)

  // parallax: the duck leans a few px away from the pointer, or from the
  // way a phone is tilted (lib/lean.ts), on a spring so it settles rather
  // than snaps
  const px = useMotionValue(0)
  const py = useMotionValue(0)
  const sx = useSpring(px, { stiffness: 60, damping: 14 })
  const sy = useSpring(py, { stiffness: 60, damping: 14 })
  const x = useTransform(sx, (v) => v * parallax)
  const y = useTransform(sy, (v) => v * parallax)

  useEffect(() => {
    if (!parallax || reduce) return
    const el = ref.current
    if (!el) return
    // subscribed, and the springs driven, only while this duck is near the
    // screen: seven ducks used to lean on every pointer move, six of them
    // off screen
    let off: (() => void) | null = null
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          off ??= onLean(({ x, y }) => {
            px.set(-x)
            py.set(-y)
          })
        } else {
          off?.()
          off = null
        }
      },
      { rootMargin: '10% 0px' },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      off?.()
    }
  }, [parallax, reduce, px, py])


  return (
    <motion.div
      ref={ref}
      aria-hidden
      // in rem, so the drawing scales with the root font size like everything
      // else. A leaning duck gets its own compositor layer: without one, every
      // pointer move re-rasterised the drawing (and, in the hero, its shadow)
      style={{ width: `${width / 16}rem`, x, y, willChange: parallax ? 'transform' : undefined }}
      className={`pointer-events-none relative shrink-0 ${p.className ?? ''} ${className}`}
    >
      <Image
        src={`/duck/${p.src}-light.png`}
        alt=""
        width={p.w}
        height={p.h}
        priority={priority}
        draggable={false}
        sizes={`${Math.round(width * 1.4)}px`}
        className="h-auto w-full select-none"
      />
    </motion.div>
  )
}
