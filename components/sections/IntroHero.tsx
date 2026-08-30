'use client'

import RoleTicker from '@/components/RoleTicker'
import { motion } from 'framer-motion'
import SkyOrb from '@/components/SkyOrb'
import HandBackground from '@/components/effects/HandBackground'

/**
 * Full-height intro shown first - an interactive liquid sky orb in the middle,
 * over the ASCII hand, with a scroll cue. The hand is a layer INSIDE this
 * section, so it scrolls up and away with the hero as the next sections slide
 * up. Name lives in the top-right tag; roles in the bottom-left ticker.
 */
export default function IntroHero() {
  return (
    <header className="relative isolate flex min-h-screen flex-col items-center justify-center px-4 py-20 text-center">
      {/* lives here, not in the page shell, so it scrolls away with the hero */}
      <RoleTicker />
      {/* ASCII hand - scoped to this section only */}
      <HandBackground />
      <motion.p
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="font-mono text-[11px] uppercase tracking-[0.45em] text-white/50"
      >
        ◇ Player Loaded
      </motion.p>

      {/* interactive liquid sky orb */}
      <SkyOrb />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="flex flex-col items-center gap-2 font-mono text-[11px] text-white/40"
      >
        <span>SCROLL TO EXPLORE</span>
        <span className="animate-blink text-white">▼</span>
      </motion.div>
    </header>
  )
}
