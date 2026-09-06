'use client'

import RoleTicker from '@/components/RoleTicker'
import { motion, useReducedMotion } from 'motion/react'
import SkyOrb from '@/components/SkyOrb'
import HandBackground from '@/components/effects/HandBackground'
import Duck from '@/components/duck/Duck'
import { ui } from '@/data/ui'
import { useLang } from '@/lib/use-lang'

/**
 * Full-height intro shown first. Two halves: on the left the duck says
 * hello with three short lines beside it; on the right the liquid sky orb,
 * as it always was, over the ASCII hand. Name lives in the top-right tag;
 * roles in the bottom-left ticker. The hand is a layer INSIDE this section,
 * so it scrolls up and away with the hero.
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
    // pt clears the header pill and, on a phone, the name tag that sits under it
    <header className="relative isolate flex min-h-[100svh] flex-col items-center justify-center px-4 pb-24 pt-36 text-center sm:pb-28 md:pt-24">
      {/* lives here, not in the page shell, so it scrolls away with the hero */}
      <RoleTicker />
      {/* ASCII hand - scoped to this section only */}
      <HandBackground />

      <div className="flex w-full max-w-5xl flex-col items-center gap-10 lg:grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-center lg:gap-8">
        {/* left: the duck says hello, the lines stand beside it */}
        <motion.div
          {...rise(0.5)}
          className="flex flex-col items-center gap-4 sm:flex-row sm:items-end sm:gap-6 lg:justify-start"
        >
          <Duck pose="hero" width={150} parallax={12} priority className="sm:!w-[190px] xl:!w-[230px]" />
          <div className="flex flex-col items-center gap-0.5 pb-2 text-center sm:items-start sm:pb-8 sm:text-left">
            <span className="whitespace-nowrap font-crt text-4xl leading-[0.95] text-fg txt-glow sm:text-5xl">{t.line1}</span>
            <span className="whitespace-nowrap font-crt text-4xl leading-[0.95] text-fg txt-glow sm:text-5xl">{t.line2}</span>
            <span className="whitespace-nowrap font-crt text-4xl leading-[0.95] text-duck sm:text-5xl">{t.line3}</span>
          </div>
        </motion.div>

        {/* right: the orb, as it was */}
        <div className="flex flex-col items-center lg:justify-self-end lg:pr-6">
          <motion.p
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="font-mono text-[11px] uppercase tracking-[0.45em] text-fg-muted"
          >
            ◇ {t.loaded}
          </motion.p>
          <SkyOrb />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="mt-10 flex flex-col items-center gap-2 font-mono text-[11px] text-fg-dim"
      >
        <span className="uppercase tracking-[0.2em]">{t.scroll}</span>
        <span className="animate-blink text-fg">▼</span>
      </motion.div>
    </header>
  )
}
