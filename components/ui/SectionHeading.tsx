'use client'

import { type ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'

/**
 * Every section's heading, in the terminal voice: the index in the section's
 * accent and the section's name above, the command the section answers as the
 * headline (a boxed `$`, then e.g. `ls ~/projects`), and one plain line under
 * it. A thin accent underline grows in beneath.
 *
 * `children` sits in the header's own box, for the hand-written note a
 * section may pin beside its heading.
 *
 * Motion is the site's: the title rises 10px over 500ms, the underline draws
 * over 700ms, once. Reduced motion places all of it.
 */
const EASE = [0.16, 1, 0.3, 1] as const

export default function SectionHeading({
  index,
  label,
  command,
  subtitle,
  children,
  className = '',
}: {
  index: string
  label: string
  command: string
  subtitle?: ReactNode
  children?: ReactNode
  className?: string
}) {
  const reduce = useReducedMotion()
  const rise = (delay: number) => ({
    initial: reduce ? false : ({ opacity: 0, y: 10 } as const),
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.6 },
    transition: { duration: reduce ? 0 : 0.5, delay: reduce ? 0 : delay, ease: EASE },
  })
  return (
    <header className={`relative mb-10 lg:mb-14 ${className}`}>
      <motion.p {...rise(0)} className="mb-4 font-mono text-sm uppercase tracking-[0.3em] text-fg th:tracking-normal sm:text-[0.9375rem]">
        <span className="mr-2 rounded-[3px] bg-accent px-1.5 py-0.5 text-xs font-bold leading-none tracking-normal text-[#111]">{index}</span>
        {label}
      </motion.p>
      <motion.div {...rise(0.06)} className="flex items-center gap-3 sm:gap-4">
        <span
          aria-hidden
          className="flex h-12 w-11 shrink-0 items-center justify-center border border-fg/20 bg-white/50 font-mono text-[2.25rem] font-bold text-accent-text sm:h-[3.75rem] sm:w-14 sm:text-[2.75rem]"
        >
          $
        </span>
        <h2 className="min-w-0 break-words font-mono text-[1.875rem] font-bold leading-[1.1] text-fg sm:text-[2.75rem] lg:text-[3.25rem]">
          <span className="sr-only">$ </span>
          {command}
        </h2>
      </motion.div>
      {subtitle && (
        <motion.p {...rise(0.12)} className="mt-3 max-w-[65ch] font-mono text-[0.9375rem] text-fg th:font-sans th:leading-[1.6] sm:text-base">
          {subtitle}
        </motion.p>
      )}
      <motion.span
        aria-hidden
        initial={reduce ? false : { scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: reduce ? 0 : 0.7, delay: reduce ? 0 : 0.15, ease: EASE }}
        className="mt-5 block h-0.5 w-24 origin-left bg-accent-text"
      />
      {children}
    </header>
  )
}
