'use client'

import { Fragment, type ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import PaperClip from '@/components/ui/PaperClip'
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
 *
 * The leaflet is three clipped notes rather than one column of text. Beside a
 * bordered spec label with a hard shadow, loose prose read as something left
 * over - the hairline rule this used to open with was there to give it an
 * edge. Paper does that job better: it gives the column weight of its own
 * instead of borrowing an edge, and it says "notes somebody wrote about this
 * machine" where a rule only said "this text is deliberate".
 */

// The steps are split by index, not regrouped: contiguous runs so 01-07 still
// reads straight down the column across the breaks, and no string moves out of
// data/ui.ts. Each note starts its own <ol start> so the numbering survives.
const NOTES: readonly { from: number; count: number }[] = [
  { from: 0, count: 2 },
  { from: 2, count: 3 },
  { from: 5, count: 2 },
]

/* Per-note tilt and offset. Under 1.5deg, alternating, with a little
   horizontal drift: enough that the pile reads as three sheets dropped one
   after another, not so much that a line of Thai starts fighting its own
   baseline. lg-only - a phone gets the notes square and full width, where a
   rotated 360px sheet would push its corner off the screen. */
const TILT = ['lg:-rotate-[1.2deg]', 'lg:rotate-[0.8deg]', 'lg:-rotate-[0.6deg]']
const DRIFT = ['lg:translate-x-0', 'lg:translate-x-3', 'lg:translate-x-1']

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

  const step = (s: Step, n: number) => (
    <li key={n} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-x-2">
      <span className="pt-[0.2em] font-mono text-xs tabular-nums text-fg-dim">{String(n).padStart(2, '0')}</span>
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
    </li>
  )

  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
      variants={{ show: { transition: { delayChildren: reduce ? 0 : delay, staggerChildren: reduce ? 0 : 0.14 } } }}
    >
      <motion.span
        variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
        className="mb-4 block font-mono text-[0.625rem] uppercase tracking-[0.35em] text-fg-dim"
      >
        {t.quickStart}
      </motion.span>

      {/* pt-4 clears the part of the clip that hangs above the first sheet */}
      <div className="flex flex-col gap-5 pt-4 lg:gap-4">
        {NOTES.map((note, i) => (
          <motion.div
            key={note.from}
            variants={{
              // the sheet drops in and settles out of its tilt, which is the
              // one thing paper does that a block of text cannot
              hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 14, rotate: i % 2 === 0 ? -2.6 : 2.2 },
              show: { opacity: 1, y: 0, rotate: 0 },
            }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            // -mt on all but the first: the sheets overlap at their margins so
            // the stack reads as a pile, never far enough to touch a line of
            // text. print:* flattens the lot - this section carries the
            // "parts that print" mark, and a tilted sheet with a drop shadow
            // is exactly what a printer makes a mess of.
            className={`relative ${i > 0 ? 'lg:-mt-3' : ''} ${TILT[i]} ${DRIFT[i]} print:rotate-0 print:translate-x-0 print:mt-0`}
          >
            {/* the back half of the clip, under the sheet */}
            <span aria-hidden className="pointer-events-none absolute -top-4 left-6 z-0 text-fg/45 print:hidden">
              <PaperClip side="back" />
            </span>

            {/* The sheet is the spec label's stock: the same #f3f0e8 paper,
                the same 1px rgba(17,17,17,0.45) edge and the same hard
                6px 6px 0 offset shadow that `.spec-label` sets in
                globals.css. Not a soft --shade drop - two different shadows
                across one row read as two different materials, and these are
                meant to be the same paper as the card they sit beside, just
                cut smaller. The hex is hardcoded for the same reason the
                label hardcodes it: it is printed stock, not themed surface.
                Change one, change the other. */}
            <div className="relative z-10 rounded-[3px] border border-[#111]/45 bg-[#f3f0e8] px-5 pb-4 pt-7 shadow-[6px_6px_0_#111] print:shadow-none">
              <ol
                start={note.from + 1}
                className="space-y-3.5 font-sans text-[0.9375rem] leading-relaxed text-fg/85 lg:space-y-4 lg:text-[1.0625rem] lg:leading-[1.72]"
              >
                {t.steps.slice(note.from, note.from + note.count).map((s, j) => step(s, note.from + j + 1))}
              </ol>
            </div>

            {/* the front half, over it. Same coordinates as the back half, so
                the two read as one piece of wire with the paper threaded
                through. */}
            <span aria-hidden className="pointer-events-none absolute -top-4 left-6 z-20 text-fg/55 print:hidden">
              <PaperClip side="front" />
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
