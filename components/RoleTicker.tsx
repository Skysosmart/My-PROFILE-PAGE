'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { player } from '@/data/portfolio'

/**
 * Terminal ticker that cycles through player.roles, swapping every 5 seconds
 * with a vertical slide.
 *
 * Positioned absolute, not fixed: it belongs to the hero and should scroll away
 * with it. Fixed meant it sat over every section all the way down the page.
 */
export default function RoleTicker() {
  const [i, setI] = useState(0)
  const roles = player.roles

  useEffect(() => {
    const id = window.setInterval(() => setI((v) => (v + 1) % roles.length), 5000)
    return () => clearInterval(id)
  }, [roles.length])

  return (
    <div className="pointer-events-none absolute bottom-4 left-4 z-[60] font-mono sm:bottom-6 sm:left-6">
      <div className="flex items-baseline gap-2">
        <span className="text-[10px] uppercase tracking-[0.35em] text-white/35">role</span>
        <span className="text-white/20">//</span>

        {/* rotating word */}
        <span className="relative inline-block h-5 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.span
              key={i}
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -16, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="block whitespace-nowrap text-sm font-bold uppercase tracking-wider text-white txt-glow"
            >
              {roles[i]}
            </motion.span>
          </AnimatePresence>
        </span>

        <span className="animate-blink text-white">▋</span>
      </div>
    </div>
  )
}
