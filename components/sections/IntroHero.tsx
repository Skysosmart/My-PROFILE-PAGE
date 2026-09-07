'use client'

import RoleTicker from '@/components/RoleTicker'
import { motion, useReducedMotion } from 'motion/react'
import SkyOrb from '@/components/SkyOrb'
import Duck from '@/components/duck/Duck'
import { ui } from '@/data/ui'
import { useLang } from '@/lib/use-lang'

/**
 * Full-height intro shown first. Two halves in conversation: on the left
 * the duck says hello with three short lines beside it; on the right Sky's
 * face in the liquid orb, answering from its own bubble. The ASCII hands
 * that used to fill this screen now generate on the boot screen instead.
 * Name lives in the top-right tag; roles in the bottom-left ticker.
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
    <header className="relative isolate flex min-h-[100svh] flex-col items-center justify-center overflow-x-clip px-4 pb-24 pt-32 text-center sm:pb-28 md:pt-24">
      {/* lives here, not in the page shell, so it scrolls away with the hero */}
      <RoleTicker />

      <div className="flex w-full max-w-7xl flex-col items-center gap-10 lg:grid lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-center lg:gap-8">
        {/* left: the duck says hello, the lines stand beside it */}
        <motion.div
          {...rise(0.5)}
          // staggered on desktop: the left half sits a little lower, the orb a little higher
          className="relative flex flex-col items-center gap-4 sm:flex-row sm:items-end sm:gap-5 lg:translate-y-10 lg:justify-start"
        >
          {/* a wash of light behind the pair: ink-coloured, so it is white on
              the dark theme and a soft black on paper */}
          <span
            aria-hidden
            className="pointer-events-none absolute -inset-x-12 -bottom-8 -top-20 -z-10 rounded-[50%] bg-[radial-gradient(ellipse_at_50%_40%,rgb(var(--fg)/0.14),transparent_64%)] blur-2xl"
          />
          {/* the duck casts a floor shadow in the same ink */}
          <div className="[filter:drop-shadow(0_26px_22px_rgb(var(--fg)/0.28))]">
            <Duck pose="hero" width={220} parallax={12} priority className="sm:!w-[15rem] lg:!w-[16.25rem] xl:!w-[18.75rem] " />
          </div>
          {/* sizes follow the room beside the duck: a row from sm, a 2:1 grid
              from lg where the column is narrower again, wide from xl. On a
              phone the size follows the width, so the widest Thai line still
              fits a 360px screen */}
          <div className="flex flex-col items-center gap-1 pb-2 text-center [text-shadow:0_0_10px_var(--glow),0_0_42px_var(--glow-far)] sm:items-start sm:pb-8 sm:text-left">
            <span className="whitespace-nowrap font-crt text-[clamp(2rem,10.5vw,3rem)] leading-[0.95] text-fg sm:text-[clamp(2rem,6.5vw,3rem)] md:text-[clamp(3rem,7vw,3.75rem)] lg:text-5xl xl:text-7xl">{t.line1}</span>
            <span className="whitespace-nowrap font-crt text-[clamp(2rem,10.5vw,3rem)] leading-[0.95] text-fg sm:text-[clamp(2rem,6.5vw,3rem)] md:text-[clamp(3rem,7vw,3.75rem)] lg:text-5xl xl:text-7xl">{t.line2}</span>
            <span className="whitespace-nowrap font-crt text-[clamp(2rem,10.5vw,3rem)] leading-[0.95] text-duck sm:text-[clamp(2rem,6.5vw,3rem)] md:text-[clamp(3rem,7vw,3.75rem)] lg:text-5xl xl:text-7xl">{t.line3}</span>
          </div>
        </motion.div>

        {/* right: the face in the orb, with its own word */}
        <div className="flex flex-col items-center lg:-translate-y-10 lg:justify-self-end lg:pr-6">
          <motion.p
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="font-mono text-[0.6875rem] uppercase tracking-[0.45em] text-fg-muted"
          >
            ◇ {t.loaded}
          </motion.p>
          <div className="relative">
            <SkyOrb />
            {/* the answer to the duck's hello: a bubble off the orb's shoulder */}
            <motion.span
              {...rise(1.0)}
              className="absolute right-0 top-6 whitespace-nowrap rounded-2xl rounded-bl-sm border border-fg/40 bg-bg px-3 py-1.5 font-sans text-[0.75rem] font-semibold text-fg shadow-[0_8px_24px_rgba(0,0,0,var(--shade))] sm:right-2"
            >
              {t.bubble}
              {/* the tail */}
              <span
                aria-hidden
                className="absolute -bottom-[0.4375rem] left-3 h-3 w-3 rotate-45 border-b border-r border-fg/40 bg-bg"
              />
            </motion.span>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-2 flex flex-col items-center gap-1.5 font-mono text-[0.6875rem] text-fg-dim"
          >
            <span className="uppercase tracking-[0.2em]">{t.scroll}</span>
            <span className="animate-blink text-fg">▼</span>
          </motion.div>
        </div>
      </div>
    </header>
  )
}
