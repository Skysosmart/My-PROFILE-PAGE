'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'

/**
 * A note written on the desk in the section's own ink: a few handwritten
 * lines (Sriracha, which writes English and Thai) and an arrow drawn in the
 * site's one pen - 2.8px, round caps and joins, non-scaling, slightly
 * imperfect - pointing at what the note is about.
 *
 * It is the one place the hand writes in colour (`text-accent-text`): the
 * projects workbench's notes are its annotations, the way a reviewer marks up
 * a printout in a blue pen. Use it sparingly; two per screen at most.
 *
 * `arrow` picks one of the drawn arrows; the note writes itself in, then the
 * pen draws the arrow. Reduced motion places both.
 *
 * The pen weight is worked out from the arrow's drawn size rather than held
 * with `vector-effect: non-scaling-stroke`: the draw-in animates a dash, and
 * a dash on a non-scaling stroke is measured in the wrong units, so a scaled
 * arrow drew as broken fragments.
 */
const PEN = 2.8 // px on screen
const ARROWS = {
  // from the note's lower-left, curling down and left (the header note -> the window)
  'down-left': {
    box: '0 0 64 56',
    shaft: 'M58 6C46 10 30 20 22 34C17 42 13 47 9 51',
    head: 'M7.5 38.5C8.2 43 8.4 47.5 8.6 52.2C13 51.6 17.4 51.4 22 51.6',
  },
  // from below the note, up and left: the mirror of up-right, for a note on the right-hand half
  'up-left': {
    box: '0 0 56 64',
    shaft: 'M48 58C46 46 40 32 30 22C24 16 18 12 10 8',
    head: 'M22.5 6.2C18.4 6.6 14 7 8.6 7.2C9.4 11.6 10.2 16 10.8 20.4',
  },
  // from below the note, up and right (the ASCII note -> the screenshot)
  'up-right': {
    box: '0 0 56 64',
    shaft: 'M8 58C10 46 16 32 26 22C32 16 38 12 46 8',
    head: 'M33.5 6.2C37.6 6.6 42 7 47.4 7.2C46.6 11.6 45.8 16 45.2 20.4',
  },
} as const

export default function InkNote({
  children,
  arrow,
  arrowClassName = '',
  arrowWidth = 'w-14',
  delay = 0,
  className = '',
}: {
  children: string
  arrow?: keyof typeof ARROWS
  /** where the arrow sits relative to the note */
  arrowClassName?: string
  /** the arrow's drawn width (a Tailwind width class) */
  arrowWidth?: string
  delay?: number
  className?: string
}) {
  const reduce = useReducedMotion()
  const a = arrow ? ARROWS[arrow] : null
  // viewBox units per screen pixel, so the stroke lands at PEN px whatever the arrow's size
  const svgRef = useRef<SVGSVGElement>(null)
  const [stroke, setStroke] = useState(PEN)
  useEffect(() => {
    const el = svgRef.current
    if (!el || !a || typeof ResizeObserver === 'undefined') return
    const units = Number(a.box.split(' ')[2])
    const ro = new ResizeObserver(([e]) => e.contentRect.width && setStroke((PEN * units) / e.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [a])
  const ink = (at: number, d: number) => ({
    initial: { pathLength: reduce ? 1 : 0 },
    whileInView: { pathLength: 1 },
    viewport: { once: true, amount: 0.6 },
    transition: { delay: reduce ? 0 : at, duration: reduce ? 0 : d, ease: 'easeInOut' as const },
  })
  return (
    // the caller positions the outer box; the note's own drawing is relative to the inner one
    <div className={`pointer-events-none text-accent-text ${className}`}>
      <div className="relative w-max">
      <motion.p
        initial={reduce ? false : { opacity: 0, y: 6 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="whitespace-pre-line font-hand text-[1.0625rem] leading-[1.15] -rotate-[4deg] th:leading-[1.5]"
      >
        {children}
      </motion.p>
      {a && (
        <svg
          ref={svgRef}
          aria-hidden
          viewBox={a.box}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`absolute h-auto ${arrowWidth} ${arrowClassName}`}
        >
          <motion.path d={a.shaft} {...ink(delay + 0.35, 0.4)} />
          <motion.path d={a.head} {...ink(delay + 0.7, 0.22)} />
        </svg>
      )}
      </div>
    </div>
  )
}
