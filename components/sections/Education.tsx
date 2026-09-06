'use client'

import { motion, useReducedMotion } from 'motion/react'
import GlassSection from '@/components/ui/GlassSection'
import { certificates } from '@/data/portfolio'
import { fmt, ui } from '@/data/ui'
import { certYear } from '@/lib/certs'
import { useContent } from '@/lib/use-content'
import { useLang } from '@/lib/use-lang'

/**
 * 02 · EDUCATION - the timeline, one chapter per school stage, the way
 * sirayuth.com tells it: years down the left, the chapter on the right,
 * focus tags, and what came out of it. The certificate count per chapter
 * is counted off the data by year, so it cannot go stale.
 */
export default function Education() {
  const lang = useLang()
  const t = ui[lang].education
  const { education } = useContent()
  const reduce = useReducedMotion()

  const count = (from: number, to?: number) =>
    certificates.filter((c) => {
      const y = Number(certYear(c))
      return y >= from && (to === undefined || y <= to)
    }).length

  return (
    <GlassSection
      id="education"
      index="02"
      title="Education"
      label={`02 · ${t.label}`}
      watermark="EDU"
      variant="slide"
      revealAmount="some"
    >
      <ol className="relative">
        {/* the rail */}
        <span
          aria-hidden
          className="absolute bottom-3 left-[0.5625rem] top-3 w-px bg-fg/15 sm:left-[calc(9rem+9px)]"
        />
        {education.map((ch, i) => {
          const n = count(ch.from, ch.to)
          const last = i === education.length - 1
          return (
            <motion.li
              key={ch.title}
              initial={reduce ? { opacity: 0 } : { opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className={`relative grid gap-3 pl-8 sm:grid-cols-[9rem_1fr] sm:gap-6 sm:pl-0 ${last ? '' : 'pb-10'}`}
            >
              {/* the node */}
              <span
                aria-hidden
                className={`absolute left-1 top-2 h-[0.6875rem] w-[0.6875rem] rounded-full border sm:left-[calc(9rem+4px)] ${
                  last ? 'border-duck bg-duck shadow-[0_0_12px_rgb(245_190_91)]' : 'border-fg/50 bg-bg'
                }`}
              />

              {/* years, down the left */}
              <div className="flex flex-col gap-1 sm:pr-8 sm:text-right">
                <span className="font-mono text-[0.625rem] uppercase tracking-[0.3em] text-fg-dim">
                  {t.chapter} {String(i + 1).padStart(2, '0')}
                </span>
                <span className="font-crt text-3xl leading-none text-fg">
                  {ch.years.replace(/present/i, t.present)}
                </span>
                <span className="font-mono text-[0.625rem] uppercase tracking-[0.2em] text-fg-muted">{ch.stage}</span>
              </div>

              {/* the chapter */}
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <h3 className="font-sans text-xl font-bold leading-snug text-fg sm:text-2xl">{ch.title}</h3>
                  {ch.href ? (
                    <a
                      href={ch.href}
                      target="_blank"
                      rel="noreferrer"
                      className="w-fit font-mono text-[0.6875rem] text-fg-muted underline-offset-4 hover:text-fg hover:underline"
                    >
                      ◇ {ch.school} ↗
                    </a>
                  ) : (
                    <span className="font-mono text-[0.6875rem] text-fg-muted">◇ {ch.school}</span>
                  )}
                </div>
                <p className="max-w-2xl font-sans text-[0.875rem] leading-relaxed text-fg/85">{ch.summary}</p>

                <div className="flex flex-col gap-1.5">
                  <span className="font-mono text-[0.5625rem] uppercase tracking-[0.3em] text-fg-dim">{t.focus}</span>
                  <ul className="flex flex-wrap gap-1.5">
                    {ch.focus.map((f) => (
                      <li key={f} className="rounded-sm border border-fg/18 px-2 py-0.5 font-mono text-[0.6875rem] text-fg/75">
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                {ch.achievements.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    <span className="font-mono text-[0.5625rem] uppercase tracking-[0.3em] text-fg-dim">{t.achievements}</span>
                    <ul className="space-y-1">
                      {ch.achievements.map((a) => (
                        <li key={a} className="flex gap-2 font-mono text-[0.75rem] leading-relaxed text-fg/85">
                          <span aria-hidden className="shrink-0 text-duck">
                            ✓
                          </span>
                          {a}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <span className="font-mono text-[0.625rem] uppercase tracking-[0.2em] text-fg-dim">
                  {n > 0 ? fmt(t.signals, { n }) : t.none}
                </span>
              </div>
            </motion.li>
          )
        })}
      </ol>
    </GlassSection>
  )
}
