'use client'

import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import InkArrow from '@/components/ui/InkArrow'
import { ui } from '@/data/ui'
import { useLang } from '@/lib/use-lang'

/**
 * The hero's "there is more below" sign: SCROLL TO EXPLORE over the
 * hand-drawn <InkArrow/>, in the pen every other drawn line on the site uses.
 *
 * Below `lg` it is pinned to the bottom of the screen: the hero is taller
 * than a phone, so in the flow the one thing whose job is to say "there is
 * more" would sit below the fold. It fades out once the hero leaves the
 * screen, and the paper gradient behind it is there so the label stays
 * readable over whatever it lands on. From `lg` it sits in the hero's flow,
 * under the duck and the lines. pointer-events-none: a sign, never a target.
 */
export default function ScrollCue() {
  const t = ui[useLang()].hero
  const reduce = useReducedMotion()
  const [inHero, setInHero] = useState(true)

  useEffect(() => {
    const hero = document.querySelector('[data-hero]')
    if (!hero || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([e]) => setInHero(e.intersectionRatio > 0.35), { threshold: [0, 0.35, 1] })
    io.observe(hero)
    return () => io.disconnect()
  }, [])

  return (
    <motion.div
      aria-hidden
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: inHero ? 1 : 0 }}
      transition={{ delay: inHero && !reduce ? 1.2 : 0, duration: reduce ? 0 : 0.3 }}
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex flex-col items-center gap-2 bg-linear-to-t from-bg via-bg/90 to-transparent pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-10 font-mono text-[0.8125rem] text-fg-dim lg:absolute lg:bottom-8 lg:z-auto lg:bg-none lg:pb-0 lg:pt-0"
    >
      {/* the Thai line is longer and stacks its marks, so it gives back the
          tracking and takes the leading it needs */}
      <span className="uppercase leading-none tracking-[0.2em] th:leading-[1.6] th:tracking-[0.04em]">{t.scroll}</span>
      <InkArrow delay={1.35} className="w-5 text-fg lg:w-7" />
    </motion.div>
  )
}
