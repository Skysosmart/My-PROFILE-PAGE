'use client'

import { Fragment, type ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { fmt, ui, type Step } from '@/data/ui'
import { certStats } from '@/lib/certs'
import { useLang } from '@/lib/use-lang'

/**
 * The leaflet that comes in the box: how to play the page. Every step is a
 * thing the site really does (the lean, the terminal's commands, the skill
 * picker, the certificate lightbox, the film, the prompt, the QR and
 * `?boot=1`), with the path to jump there. Steps that differ by device carry
 * both readings; the pointer decides (pointer-coarse: the phone's).
 *
 * `code` in a string is anything between backticks. The steps are `Step`s in
 * data/ui.ts.
 */

// backticks become keycaps
function keyed(s: string): ReactNode {
  return s.split(/`([^`]+)`/).map((part, i) =>
    i % 2 === 1 ? (
      <code key={i} className="whitespace-nowrap rounded-xs border border-fg/20 bg-fg/[0.06] px-1 py-px font-mono text-[0.8em] text-fg">
        {part}
      </code>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  )
}

export default function QuickStart({ delay = 0 }: { delay?: number }) {
  const lang = useLang()
  const t = ui[lang].profile
  const reduce = useReducedMotion()
  const vars = { n: certStats.total }
  const jump = (id: string) => (e: React.MouseEvent) => {
    const el = document.getElementById(id)
    if (!el) return
    e.preventDefault()
    el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
      variants={{ show: { transition: { delayChildren: reduce ? 0 : delay, staggerChildren: reduce ? 0 : 0.1 } } }}
      className="lg:pt-2"
    >
      <motion.span
        variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
        className="mb-4 block font-mono text-[0.625rem] uppercase tracking-[0.35em] text-fg-dim"
      >
        {t.quickStart}
      </motion.span>
      <ol className="space-y-3.5 font-sans text-[0.9375rem] leading-relaxed text-fg/85">
        {t.steps.map((s, i) => (
          <motion.li
            key={i}
            variants={{ hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-[2rem_minmax(0,1fr)] gap-x-2"
          >
            <span className="pt-[0.2em] font-mono text-xs tabular-nums text-fg-dim">{String(i + 1).padStart(2, '0')}</span>
            <span>
              {s.text !== undefined && keyed(fmt(s.text, vars))}
              {s.fine !== undefined && <span className="pointer-coarse:hidden">{keyed(fmt(s.fine, vars))}</span>}
              {s.coarse !== undefined && <span className="hidden pointer-coarse:inline">{keyed(fmt(s.coarse, vars))}</span>}
              {s.to && (
                <>
                  {' '}
                  <a
                    href={`#${s.to}`}
                    onClick={jump(s.to)}
                    data-cursor-label="jump"
                    className="whitespace-nowrap font-mono text-[0.75rem] text-fg-dim transition-colors hover:text-fg focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg"
                  >
                    → /{s.to}
                  </a>
                </>
              )}
            </span>
          </motion.li>
        ))}
      </ol>
    </motion.div>
  )
}
