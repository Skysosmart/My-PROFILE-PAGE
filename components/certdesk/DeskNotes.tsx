'use client'

import { motion } from 'motion/react'
import type { Certificate } from '@/data/portfolio'

/**
 * The notes written round a picked-up certificate: what it taught on the
 * left, the result on the right, who issued it underneath, the title above.
 * Editorial labels in the mono, the content in the hand, and a short pen
 * stroke from each block to the sheet - the way you would annotate a
 * printout, not a panel beside it.
 *
 * `rect` is the sheet's resting place on the desk once it is picked up, in
 * desk pixels. The notes are only drawn once the sheet has arrived
 * (`shown`), and go first when it is put back: the sheet moves, then the
 * words, never the other way round.
 */
const EASE = [0.16, 1, 0.3, 1] as const
const GAP = 34 // px between the sheet and a note column

export default function DeskNotes({
  cert,
  rect,
  desk,
  shown,
  reduce,
  onClose,
  onScan,
  closeRef,
}: {
  cert: Certificate
  rect: { x: number; y: number; w: number; h: number }
  desk: { w: number; h: number }
  shown: boolean
  reduce: boolean
  onClose: () => void
  onScan: () => void
  closeRef: React.RefObject<HTMLButtonElement | null>
}) {
  const side = Math.max(150, rect.x - GAP - 12)
  const t = (delay: number) => ({
    duration: reduce ? 0 : shown ? 0.4 : 0.14,
    delay: reduce || !shown ? 0 : delay,
    ease: EASE,
  })
  const ink = (delay: number) => ({
    initial: { pathLength: 0 },
    animate: { pathLength: shown ? 1 : 0 },
    transition: { duration: reduce ? 0 : shown ? 0.35 : 0.1, delay: reduce || !shown ? 0 : delay, ease: 'easeInOut' as const },
  })
  const midY = rect.y + rect.h * 0.38
  const label = 'font-mono text-[0.6875rem] uppercase tracking-[0.06em] text-fg-dim th:tracking-normal'

  return (
    <div className="pointer-events-none absolute inset-0 z-[70]" aria-live="polite">
      {/* the title, above the sheet */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: shown ? 1 : 0, y: shown ? 0 : 6 }}
        transition={t(0.12)}
        style={{ left: rect.x - 40, width: rect.w + 80, bottom: desk.h - rect.y + 14 }}
        className="absolute text-center"
      >
        <h3 className="font-sans text-[1.125rem] font-semibold leading-snug text-fg">{cert.title}</h3>
        {cert.blurb && <p className="mt-1 font-sans text-[0.875rem] leading-snug text-fg-muted">{cert.blurb}</p>}
      </motion.div>

      {/* left: what it taught */}
      {cert.learned?.length || cert.skills?.length ? (
        <motion.div
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: shown ? 1 : 0, x: shown ? 0 : 8 }}
          transition={t(0.2)}
          style={{ right: desk.w - rect.x + GAP, top: midY - 18, width: Math.min(side, 300) }}
          className="absolute text-right"
        >
          {cert.learned?.length ? (
            <>
              <p className={label}>What I learned</p>
              <ul className="m-0 mt-2 list-none space-y-1 p-0 font-hand text-[1.0625rem] leading-snug text-fg">
                {cert.learned.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
            </>
          ) : null}
          {cert.skills?.length ? (
            <p className="mt-4 font-mono text-[0.75rem] leading-relaxed text-fg-muted">{cert.skills.join(' · ')}</p>
          ) : null}
        </motion.div>
      ) : null}
      <svg aria-hidden className="absolute overflow-visible" style={{ left: rect.x - GAP + 4, top: midY - 8, width: GAP - 8, height: 24 }}>
        <motion.path d={`M0 6 C ${(GAP - 8) * 0.45} 2, ${(GAP - 8) * 0.7} 10, ${GAP - 10} 14`} fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" className="text-fg/70" {...ink(0.38)} />
      </svg>

      {/* right: how it went */}
      <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: shown ? 1 : 0, x: shown ? 0 : -8 }}
        transition={t(0.26)}
        style={{ left: rect.x + rect.w + GAP, top: midY - 18, width: Math.min(desk.w - rect.x - rect.w - GAP - 12, 300) }}
        className="absolute"
      >
        <p className={label}>{cert.medal ? 'Award' : 'Result'}</p>
        <p className="mt-2 font-hand text-[1.375rem] leading-tight text-fg">{cert.result ?? 'Completed'}</p>
        <p className="mt-2 font-mono text-[0.75rem] uppercase tracking-[0.04em] text-fg-muted th:tracking-normal">
          {[cert.level, cert.date].filter(Boolean).join(' · ')}
        </p>
        {cert.credential && <p className="mt-3 font-mono text-[0.75rem] text-fg-muted">credential {cert.credential}</p>}
      </motion.div>
      <svg aria-hidden className="absolute overflow-visible" style={{ left: rect.x + rect.w + 4, top: midY - 8, width: GAP - 8, height: 24 }}>
        <motion.path d={`M${GAP - 8} 6 C ${(GAP - 8) * 0.55} 2, ${(GAP - 8) * 0.3} 10, 2 14`} fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" className="text-fg/70" {...ink(0.44)} />
      </svg>

      {/* below: who signed it, and the ways out */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: shown ? 1 : 0, y: shown ? 0 : -6 }}
        transition={t(0.32)}
        style={{ left: rect.x - 60, width: rect.w + 120, top: rect.y + rect.h + 18 }}
        className="absolute flex flex-col items-center text-center"
      >
        <p className={label}>Issued by</p>
        <p className="mt-1 font-hand text-[1.0625rem] leading-snug text-fg">{cert.issuer}</p>
        <div className="pointer-events-auto mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 font-mono text-[0.75rem] uppercase tracking-[0.04em] th:tracking-normal">
          <button
            type="button"
            onClick={onScan}
            tabIndex={shown ? 0 : -1}
            className="rounded-[3px] bg-[#111] px-3 py-1.5 text-[rgb(var(--bg))] transition-opacity hover:opacity-85 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg"
          >
            {cert.moment ? 'The scan + photos' : 'The full scan'} ↗
          </button>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            tabIndex={shown ? 0 : -1}
            className="text-fg underline-offset-4 hover:underline focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg"
          >
            Put it back ↓
          </button>
        </div>
      </motion.div>
    </div>
  )
}
