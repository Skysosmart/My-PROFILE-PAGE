'use client'

import RoleTicker from '@/components/RoleTicker'
import { motion, useReducedMotion } from 'motion/react'
import SkyOrb from '@/components/SkyOrb'
import HandBackground from '@/components/effects/HandBackground'
import Duck from '@/components/duck/Duck'
import { ui } from '@/data/ui'
import { useLang } from '@/lib/use-lang'

/**
 * Full-height intro shown first. The ASCII hand and the liquid sky orb are
 * as they were; the duck waves from the left and three short lines sit on
 * the right, and that is all. The numbers moved down to the profile: three
 * focal points on one screen was already plenty. Name lives in the top-right
 * tag; roles in the bottom-left ticker. The hand is a layer INSIDE this
 * section, so it scrolls up and away with the hero.
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

      <div className="flex w-full max-w-5xl flex-col items-center gap-8 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:gap-6">
        {/* the duck, waving from the left */}
        <motion.div {...rise(0.5)} className="order-2 flex justify-center lg:order-1 lg:justify-end lg:pr-4">
          <Duck pose="hero" width={120} parallax={12} priority className="lg:!w-[170px] xl:!w-[200px]" />
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

        {/* three short lines, in Sky's voice */}
        <motion.div
          {...rise(0.7)}
          className="order-3 flex flex-col items-center gap-0.5 text-center lg:items-start lg:pl-4 lg:text-left"
        >
          <span className="whitespace-nowrap font-crt text-4xl leading-[0.95] text-fg txt-glow sm:text-5xl">{t.line1}</span>
          <span className="whitespace-nowrap font-crt text-4xl leading-[0.95] text-fg txt-glow sm:text-5xl">{t.line2}</span>
          <span className="whitespace-nowrap font-crt text-4xl leading-[0.95] text-duck sm:text-5xl">{t.line3}</span>
        </motion.div>
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
