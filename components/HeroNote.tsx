'use client'

import Image from 'next/image'
import { motion, useReducedMotion } from 'motion/react'
import PaperClip from '@/components/ui/PaperClip'
import { assets, player } from '@/data/portfolio'
import { ui } from '@/data/ui'
import { useLang } from '@/lib/use-lang'

/**
 * The hero's right-hand answer to the duck: a note clipped on, with a small
 * passport print of Sky, his hello, and where to go next. It replaced the
 * liquid orb, so the hello the orb's bubble used to say lives here now.
 *
 * The sheet is the quick-start notes' paper exactly - the spec label's
 * stock, its hard 6px shadow, a 3px corner, the split paper clip (back half
 * under the sheet, front half over it) - so the hero and the profile read as
 * one desk. The clip holds the print and the sheet together.
 *
 * It drops in tilted and settles at a slight angle, on the same beat the orb
 * used to rise on. Reduced motion places it.
 */
export default function HeroNote({ delay = 1.0 }: { delay?: number }) {
  const t = ui[useLang()].hero
  const reduce = useReducedMotion()

  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 18, rotate: -6 }}
      animate={{ opacity: 1, y: 0, rotate: -2 }}
      transition={{ delay, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      // the opening film's capture finds the note by this (opening/capture.mjs)
      data-hero-note=""
      className="relative w-[min(23rem,90vw)] print:rotate-0"
    >
      <span aria-hidden className="pointer-events-none absolute -top-4 left-7 z-0 text-fg/45">
        <PaperClip side="back" />
      </span>
      <div className="relative z-10 flex gap-4 rounded-[3px] border border-[#111]/45 bg-white px-4 pb-4 pt-6 text-left shadow-[6px_6px_0_#111]">
        {/* the print: square, in colour, a hairline of ink round it */}
        <Image
          src={assets.portrait}
          alt={player.name}
          width={160}
          height={160}
          sizes="6rem"
          className="h-24 w-24 shrink-0 border border-[#111]/60 object-cover object-top"
        />
        <div className="min-w-0">
          <p className="font-sans text-lg font-semibold leading-snug text-fg">{t.bubble}</p>
          <p className="mt-1.5 font-sans text-[0.9375rem] leading-relaxed text-fg-muted th:leading-[1.7]">{t.note}</p>
        </div>
      </div>
      <span aria-hidden className="pointer-events-none absolute -top-4 left-7 z-20 text-fg/55">
        <PaperClip side="front" />
      </span>
    </motion.div>
  )
}
