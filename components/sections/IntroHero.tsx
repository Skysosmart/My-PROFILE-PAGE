'use client'

import { useEffect, useRef, useState } from 'react'
import RoleTicker from '@/components/RoleTicker'
import { motion, useReducedMotion } from 'motion/react'
import SkyOrb from '@/components/SkyOrb'
import InkBubble from '@/components/ui/InkBubble'
import ScrollCue from '@/components/ui/ScrollCue'
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

  // The scroll cue is pinned to the bottom of the screen below lg. The hero
  // is taller than a phone - 1053px against 780 on a 360 screen in Thai,
  // more with the taller Thai leading - so in the flow the cue sits below
  // the fold on every phone size, and the one thing whose job is to say
  // "there is more" is the thing nobody sees. Pinned, it is an affordance
  // rather than content, and it goes when the hero does.
  const heroRef = useRef<HTMLElement>(null)
  const [inHero, setInHero] = useState(true)
  useEffect(() => {
    const el = heroRef.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setInHero(e.isIntersecting), { threshold: 0.15 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
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
    <header ref={heroRef} className="relative isolate flex min-h-[100svh] flex-col items-center justify-center overflow-x-clip px-4 pb-24 pt-32 text-center sm:pb-28 md:pt-24">
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
            <span className="whitespace-nowrap font-crt text-[clamp(2rem,10.5vw,3rem)] leading-[0.95] th:leading-[1.3] text-fg sm:text-[clamp(2rem,6.5vw,3rem)] md:text-[clamp(3rem,7vw,3.75rem)] lg:text-5xl xl:text-7xl">{t.line1}</span>
            <span className="whitespace-nowrap font-crt text-[clamp(2rem,10.5vw,3rem)] leading-[0.95] th:leading-[1.3] text-fg sm:text-[clamp(2rem,6.5vw,3rem)] md:text-[clamp(3rem,7vw,3.75rem)] lg:text-5xl xl:text-7xl">{t.line2}</span>
            <span className="whitespace-nowrap font-crt text-[clamp(2rem,10.5vw,3rem)] leading-[0.95] th:leading-[1.3] text-duck sm:text-[clamp(2rem,6.5vw,3rem)] md:text-[clamp(3rem,7vw,3.75rem)] lg:text-5xl xl:text-7xl">{t.line3}</span>
          </div>
        </motion.div>

        {/* right: the face in the orb, with its own word. The eyebrow that
            used to head this column is gone; the cue at its foot is taller
            than the ▼ it replaced by about what that line occupied, so the
            column's height - and with it the lg stagger against the duck's
            +10 - lands within a couple of pixels of where it was and needs
            no counterweight. */}
        <div className="flex flex-col items-center lg:-translate-y-10 lg:justify-self-end lg:pr-6">
          {/* the answer to the duck's hello. Inside <SkyOrb/>, not beside it,
              so it travels with the orb's drift; centred over the crown so the
              tail points at the face in either language, instead of being
              pinned a fixed distance from an edge that moves when the text
              gets longer.

              The gap above the crown is not slack: the disc scales 1.06 on
              hover about its own centre, so the rim climbs - 8px at 1440,
              10px at 1920 - while the bubble, a sibling of the disc rather
              than a child, stays put. With the tail resting on the crown the
              rim swallowed it. sm and up buys that back; SkyOrb's own mt is
              what holds that room open now the eyebrow above it is gone, and
              a phone has no pointer to hover with, so it keeps the tighter
              gap. */}
          <SkyOrb>
            <motion.span
              {...rise(1.0)}
              className="absolute -top-16 left-1/2 -translate-x-1/2 whitespace-nowrap text-fg"
            >
              <InkBubble className="font-sans text-[0.75rem] font-semibold">{t.bubble}</InkBubble>
            </motion.span>
          </SkyOrb>
          {/* Four designs for this sign were built against one brief and none
              was obviously wrong, so all four live in <ScrollCue/> and
              ?cue=a|b|c|d picks between them on the real hero. The pinning,
              the gradient and the inHero fade are the component's; only the
              observer that drives it stays here. */}
          <ScrollCue inHero={inHero} />
        </div>
      </div>
    </header>
  )
}
