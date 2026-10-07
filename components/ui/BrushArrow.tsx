'use client'

import { useId } from 'react'
import { motion, useReducedMotion } from 'motion/react'

/**
 * The hero's arrow, painted rather than penned: the same felt-marker hand as
 * the ZaruTech lettering and its swoosh, heavy where the brush lands and
 * thinning as it lifts. Where <InkArrow/> is a line of even weight, this is
 * three filled strokes - the shaft, then each arm of the head - so it can
 * carry the taper a pen cannot.
 *
 * It paints itself on the way a brush would: a pen-width mask runs down each
 * stroke's centre line, shaft first, then the left arm, then the right, each
 * revealing the filled shape underneath. The arms are deliberately unequal,
 * as on the ink arrow: the right one is steeper and shorter. Then it bobs, a
 * breath held between passes. Under reduced motion it is painted whole and
 * never moves.
 */
const SHAFT = 'M23 9C21 3 38 1 39.5 8C40 32 36 62 35.6 92C35.4 104 35.2 112 34.6 119L27.4 119C27 110 26.6 99 26.4 88C25.8 60 24.5 34 23 9Z'
const LEFT = 'M6 100C3.5 93 12 88.5 15.5 93.5C21 102 27 113 33.5 125L28.6 131C21 121 12.5 110 6 100Z'
const RIGHT = 'M50 89.5C53 84 60.5 87.5 58.6 94C53 106 43.5 119 34 131L29.4 126.5C37 116 44 102 50 89.5Z'
// the centre lines the brush travels, in painting order. Each starts and
// ends a little past its shape: the mask's caps are butt (a round cap shows
// a dot before the brush has moved), so the overrun covers the shape's own
// rounded ends
const PATHS = [
  'M30.6 -2C33 40 30 80 31 124',
  'M2 84C18 107 25 119 32 134',
  'M61 81C47 106 39.5 118 31 134',
]

export default function BrushArrow({
  delay = 0,
  className = '',
  splash = false,
}: {
  delay?: number
  className?: string
  /** land with an ink splash at the tip: a puddle and flung droplets, once the head is painted */
  splash?: boolean
}) {
  const reduce = useReducedMotion()
  const id = useId().replace(/:/g, '')
  const paint = (i: number) => ({
    initial: { pathLength: reduce ? 1 : 0 },
    animate: { pathLength: 1 },
    transition: {
      delay: reduce ? 0 : delay + [0, 0.5, 0.72][i],
      duration: reduce ? 0 : [0.55, 0.26, 0.24][i],
      ease: [0.45, 0, 0.2, 1] as const,
    },
  })

  return (
    <span className={`relative inline-block ${className}`}>
    <motion.svg
      aria-hidden
      viewBox="0 0 62 136"
      fill="currentColor"
      // the bob waits for the splash to land; the splash stays on the floor
      animate={reduce ? undefined : { y: [0, 5, 0] }}
      transition={reduce ? undefined : { delay: delay + (splash ? 1.6 : 1.1), duration: 2.6, ease: 'easeInOut', repeat: Infinity, repeatDelay: 0.5 }}
      className="relative block h-auto w-full"
    >
      <defs>
        {PATHS.map((d, i) => (
          <mask key={i} id={`${id}-m${i}`} maskUnits="userSpaceOnUse" x="0" y="0" width="62" height="136">
            <motion.path d={d} fill="none" stroke="#fff" strokeWidth={22} strokeLinecap="butt" {...paint(i)} />
          </mask>
        ))}
      </defs>
      <path d={SHAFT} mask={`url(#${id}-m0)`} />
      <path d={LEFT} mask={`url(#${id}-m1)`} />
      <path d={RIGHT} mask={`url(#${id}-m2)`} />
    </motion.svg>
    {splash && (
      // the tip sits at (100, 20) of this box; it bursts out from there as the head lands
      <motion.svg
        aria-hidden
        viewBox="0 0 200 80"
        fill="currentColor"
        initial={reduce ? false : { scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={reduce ? { duration: 0 } : { delay: delay + 0.98, type: 'spring', stiffness: 380, damping: 16 }}
        style={{ transformOrigin: '50% 25%' }}
        className="pointer-events-none absolute bottom-[-36%] left-1/2 w-[260%] -translate-x-1/2"
      >
        <path d="M66 26C70 18 84 15 95 19C102 13 115 14 121 20C133 17 141 24 136 31C142 37 130 42 118 38C110 44 96 44 88 38C76 42 62 37 66 30Z" />
        <circle cx="42" cy="27" r="5.5" />
        <circle cx="161" cy="25" r="6" />
        <circle cx="24" cy="44" r="3.2" />
        <circle cx="178" cy="47" r="3.6" />
        <circle cx="72" cy="9" r="2.8" />
        <circle cx="131" cy="7" r="2.4" />
        <circle cx="54" cy="56" r="2.6" />
        <circle cx="148" cy="60" r="3" />
        <path d="M30 18c4-2 8-1 9 2s-3 5-6 4-5-3-3-6z" />
        <path d="M166 10c3-2 7-1 7 2s-3 4-6 3-3-3-1-5z" />
      </motion.svg>
    )}
    </span>
  )
}
