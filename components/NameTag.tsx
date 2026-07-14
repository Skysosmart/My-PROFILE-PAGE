'use client'

import { motion } from 'framer-motion'
import { player } from '@/data/portfolio'

/**
 * Fixed top-right name tag. First name and surname on separate lines,
 * right-aligned. On mobile it sits below the header pill so they don't collide.
 */
export default function NameTag() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.6 }}
      className="pointer-events-none fixed right-4 top-[74px] z-[65] text-right font-mono sm:right-6 md:top-5"
    >
      <p className="text-lg font-bold uppercase leading-none tracking-wide text-white txt-glow sm:text-xl">
        {player.firstName}
      </p>
      <p className="mt-1.5 text-[11px] uppercase tracking-[0.35em] text-white/55">
        {player.lastName}
      </p>
    </motion.div>
  )
}
