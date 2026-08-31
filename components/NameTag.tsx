'use client'

import { motion } from 'framer-motion'
import { player } from '@/data/portfolio'

/**
 * Top-right name tag. First name and surname on separate lines, right-aligned.
 * Fixed from md up. On a phone it is absolute instead - it sits under the
 * header pill on the hero and scrolls away with it, because fixed at that
 * size it landed on every section title that scrolled beneath it.
 */
export default function NameTag() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.6 }}
      className="pointer-events-none absolute right-4 top-[74px] z-[65] text-right font-mono sm:right-6 md:fixed md:top-5"
    >
      <p className="text-lg font-bold uppercase leading-none tracking-wide text-fg txt-glow sm:text-xl">
        {player.firstName}
      </p>
      <p className="mt-1.5 text-[11px] uppercase tracking-[0.35em] text-fg-muted">
        {player.lastName}
      </p>
    </motion.div>
  )
}
