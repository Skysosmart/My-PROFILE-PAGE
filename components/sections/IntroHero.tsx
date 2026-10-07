'use client'

import RoleTicker from '@/components/RoleTicker'
import { motion, useReducedMotion } from 'motion/react'
import Duck from '@/components/duck/Duck'
import ScrollCue from '@/components/ui/ScrollCue'
import { ui } from '@/data/ui'
import { useLang } from '@/lib/use-lang'

/**
 * Full-height intro shown first: the duck saying hello on the left, the
 * three lines on its right, and SCROLL TO EXPLORE with the drawn arrow at the bottom
 * (pinned to the screen's bottom on a phone, ScrollCue).
 * On a phone the duck stands above the lines. Name lives in the top-right
 * tag; roles in the top-left ticker.
 */
export default function IntroHero() {
  const t = ui[useLang()].hero
  const reduce = useReducedMotion()

  const rise = (delay: number) => ({
    initial: reduce ? { opacity: 0 } : { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  })

  return (
    // pt clears the header pill and, on a phone, the name tag and the role
    // ticker that share the row under it. overflow-x-clip: the glow behind
    // the duck reaches past its block, and on a phone in Thai that put it
    // past the screen's edge - a page wider than the phone, which the phone
    // then zoomed out to fit
    <header data-hero className="relative isolate flex min-h-[100svh] flex-col items-center justify-center overflow-x-clip px-4 pb-24 pt-32 text-center sm:pb-28 md:pt-24">
      {/* lives here, not in the page shell, so it scrolls away with the hero */}
      <RoleTicker />

      <div className="flex w-full max-w-7xl flex-col items-center">
        {/* the duck on the left saying hello, the lines out on the right (a
            phone stacks the duck above the lines) */}
        <motion.div
          {...rise(0.5)}
          className="relative flex w-full flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-between sm:gap-10"
        >
          {/* a wash of light behind the pair: ink-coloured, so it is white on
              the dark theme and a soft black on paper */}
          <span
            aria-hidden
            className="pointer-events-none absolute -inset-x-12 -bottom-8 -top-20 -z-10 rounded-[50%] bg-[radial-gradient(ellipse_at_50%_40%,rgb(var(--fg)/0.14),transparent_64%)] blur-2xl"
          />
          {/* the duck casts a floor shadow in the same ink */}
          <div className="relative">
            <div className="[filter:drop-shadow(0_26px_22px_rgb(var(--fg)/0.28))]">
              <Duck pose="hero" width={250} parallax={12} priority className="sm:!w-[18rem] lg:!w-[22rem] xl:!w-[26rem]" />
            </div>
          </div>
          {/* sizes follow the room beside the duck: a row from sm, bigger from
              lg and xl. On a phone the size follows the width. The lines are
              English in both languages (data/ui.ts), sized the same */}
          <div lang="en" className="flex flex-col items-center gap-1 pb-2 text-center [text-shadow:0_0_10px_var(--glow),0_0_42px_var(--glow-far)] sm:items-start sm:pb-8 sm:text-left">
            <span className="whitespace-nowrap font-crt text-[clamp(2.25rem,11vw,3.5rem)] leading-[0.95] text-fg sm:text-[clamp(2.5rem,7vw,3.5rem)] md:text-[clamp(3.5rem,8vw,4.75rem)] lg:text-[5.5rem] xl:text-[7rem]">{t.line1}</span>
            <span className="whitespace-nowrap font-crt text-[clamp(2.25rem,11vw,3.5rem)] leading-[0.95] text-fg sm:text-[clamp(2.5rem,7vw,3.5rem)] md:text-[clamp(3.5rem,8vw,4.75rem)] lg:text-[5.5rem] xl:text-[7rem]">{t.line2}</span>
            <span className="whitespace-nowrap font-crt text-[clamp(2.25rem,11vw,3.5rem)] leading-[0.95] text-duck-deep sm:text-[clamp(2.5rem,7vw,3.5rem)] md:text-[clamp(3.5rem,8vw,4.75rem)] lg:text-[5.5rem] xl:text-[7rem]">{t.line3}</span>
          </div>
        </motion.div>

      </div>

      <ScrollCue />
    </header>
  )
}
