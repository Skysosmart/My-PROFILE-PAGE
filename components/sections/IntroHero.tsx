'use client'

import RoleTicker from '@/components/RoleTicker'
import { motion, useReducedMotion } from 'motion/react'
import SkyOrb from '@/components/SkyOrb'
import HandBackground from '@/components/effects/HandBackground'
import Duck from '@/components/duck/Duck'
import StatsBar from '@/components/StatsBar'
import { ui } from '@/data/ui'
import { useLang } from '@/lib/use-lang'

/**
 * Full-height intro shown first. The ASCII hand and the liquid sky orb are
 * as they were; what is new around them is the duck on the left, three lines
 * of copy on the right (the shape cartooneast.in opens with), and the stats
 * bar counted off the data under it all. Name lives in the top-right tag;
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

      <div className="flex w-full max-w-6xl flex-col items-center gap-6 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:gap-4">
        {/* the duck, leaning in from the left */}
        <motion.div {...rise(0.5)} className="order-2 flex justify-center lg:order-1 lg:justify-end lg:pr-6">
          <Duck pose="hero" width={150} parallax={12} priority className="lg:!w-[200px] xl:!w-[240px]" />
        </motion.div>

        {/* the orb, as it was */}
        <div className="order-1 flex flex-col items-center lg:order-2">
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

        {/* three lines, in Sky's voice */}
        <motion.div
          {...rise(0.7)}
          className="order-3 flex flex-col items-center gap-1 text-center lg:items-end lg:pl-6 lg:text-right"
        >
          <span className="font-mono text-[12px] uppercase tracking-[0.3em] text-fg-muted">{t.hi}</span>
          <span className="whitespace-nowrap font-crt text-5xl leading-[0.92] text-fg txt-glow sm:text-6xl xl:text-7xl">{t.line1}</span>
          <span className="whitespace-nowrap font-crt text-5xl leading-[0.92] text-fg txt-glow sm:text-6xl xl:text-7xl">{t.line2}</span>
          <span className="whitespace-nowrap font-crt text-5xl leading-[0.92] text-duck sm:text-6xl xl:text-7xl">{t.line3}</span>
        </motion.div>
      </div>

      <motion.div {...rise(0.9)} className="mt-8 w-full max-w-3xl sm:w-auto">
        <StatsBar />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="mt-6 flex flex-col items-center gap-2 font-mono text-[11px] text-fg-dim"
      >
        <span className="uppercase tracking-[0.2em]">{t.scroll}</span>
        <span className="animate-blink text-fg">▼</span>
      </motion.div>
    </header>
  )
}
