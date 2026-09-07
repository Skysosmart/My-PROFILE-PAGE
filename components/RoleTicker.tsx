'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useContent } from '@/lib/use-content'

/**
 * Terminal ticker that cycles through player.roles, swapping every 5 seconds
 * with a vertical slide.
 *
 * Positioned absolute, not fixed: it belongs to the hero and should scroll away
 * with it. Fixed meant it sat over every section all the way down the page.
 * Top-left, opposite the name tag.
 */
export default function RoleTicker() {
  const [i, setI] = useState(0)
  const { player } = useContent()
  const roles = player.roles

  useEffect(() => {
    const id = window.setInterval(() => setI((v) => (v + 1) % roles.length), 5000)
    return () => clearInterval(id)
  }, [roles.length])

  return (
    // top-left, the mirror of the name tag at top-right, on the same row as
    // the tag's first name; on a phone both sit under the header pill, and
    // the ticker drops its "role" word and a size so the two share the row
    // with room between them; from xl the pill leaves the corners free
    <div className="pointer-events-none absolute left-4 top-[4.625rem] z-60 font-mono sm:left-6 xl:top-6">
      <div className="flex items-baseline gap-1.5 sm:gap-2">
        <span className="hidden text-[0.625rem] uppercase tracking-[0.35em] text-fg-dim sm:inline">role</span>
        <span className="text-fg/20">{'//'}</span>

        {/* rotating word */}
        <span className="relative inline-block h-5 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.span
              key={i}
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -16, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="block whitespace-nowrap text-[0.625rem] font-bold uppercase tracking-[0.08em] text-fg txt-glow sm:text-sm sm:tracking-wider"
            >
              {roles[i]}
            </motion.span>
          </AnimatePresence>
        </span>

        <span className="animate-blink text-fg">▋</span>
      </div>
    </div>
  )
}
