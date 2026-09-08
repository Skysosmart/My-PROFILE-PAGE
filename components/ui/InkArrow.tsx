'use client'

import { motion, useReducedMotion } from 'motion/react'

/**
 * The scroll cue's arrow, drawn in the same hand as <InkBubble/>: one pen
 * weight, round caps and joins, currentColor, and lines that wander instead
 * of ruling straight. It has to be this and not a geometric chevron because
 * of where it sits - directly under the orb, whose bubble is hand-inked. A
 * clean 24-grid icon there reads as a second author on the same page.
 *
 * Two strokes, not one, because that is the order a hand draws an arrow in:
 * the shaft, then the head laid across its end as a single V. The arms are
 * deliberately unequal - the right one runs a little steeper and stops a
 * little higher than the left, and the two bow opposite ways - which is what
 * sells the hand at this size. Symmetrical wobble just reads as a badly
 * built icon. The shaft wanders about 8% of the box; past roughly a tenth it
 * stops looking pulled and starts looking broken.
 *
 * non-scaling-stroke for the same reason the bubble uses it: the ink is
 * pinned at a real 2.8px in whatever box it lands in, so the arrow and the
 * bubble keep one pen weight between them at every viewport - including the
 * wide ones, where the page's rem scales to 140% and the box grows but the
 * bubble's outline does not.
 */
export default function InkArrow({
  delay = 0,
  className = '',
}: {
  delay?: number
  className?: string
}) {
  const reduce = useReducedMotion()

  // The two strokes ink themselves in, shaft first - the pen being put down
  // rather than the arrow fading up with everything else - and the caller
  // passes the delay because the cue it lives in owns the timeline. Under
  // reduced motion both paths start at full length and take no time to get
  // there: the arrow has to be legible having never moved.
  const ink = (at: number) => ({
    initial: { pathLength: reduce ? 1 : 0 },
    animate: { pathLength: 1 },
    transition: { delay: reduce ? 0 : at, duration: reduce ? 0 : 0.45, ease: 'easeInOut' as const },
  })

  return (
    <motion.svg
      aria-hidden
      viewBox="0 0 24 36"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      // A slow bob of three and a half pixels, held still for a beat between
      // passes so it breathes rather than ticks. It waits for the ink to
      // finish drawing, and under reduced motion it never starts.
      animate={reduce ? undefined : { y: [0, 3.5, 0] }}
      transition={
        reduce
          ? undefined
          : { delay: delay + 1, duration: 2.6, ease: 'easeInOut', repeat: Infinity, repeatDelay: 0.5 }
      }
      // height comes from the viewBox: one number to change the size by
      className={`h-auto w-5 ${className}`}
    >
      {/* the shaft */}
      <motion.path
        d="M10.8 2.4C13.3 7.8 10.4 12.4 11.4 17.6C12.2 22 13.2 26.6 12.6 31.4"
        vectorEffect="non-scaling-stroke"
        {...ink(delay)}
      />
      {/* the head, one V across the shaft's end */}
      <motion.path
        d="M6.6 23.8C8.7 26.6 10.9 29.3 12.7 32.4C14.7 29.3 16.5 26.8 18.5 23.2"
        vectorEffect="non-scaling-stroke"
        {...ink(delay + 0.4)}
      />
    </motion.svg>
  )
}
