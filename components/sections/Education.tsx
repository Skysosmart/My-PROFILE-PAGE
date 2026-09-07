'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react'
import GlassSection from '@/components/ui/GlassSection'
import { certificates } from '@/data/portfolio'
import { fmt, ui } from '@/data/ui'
import { certYear } from '@/lib/certs'
import { useContent } from '@/lib/use-content'
import { useLang } from '@/lib/use-lang'

/**
 * 02 · EDUCATION - a scroll-driven timeline, the way sirayuth.com tells it.
 * A rail runs down the left and fills as you read; each chapter's node and
 * years stick beside its content while that content scrolls past, then
 * hand over to the next. On the right, per chapter: the stage, the title,
 * the school, a box of counts, the summary, three pillars, what came out
 * of it, a line to remember it by. Flat on the page, no panel: the page
 * itself is the timeline.
 *
 * The certificate count per chapter is counted off the data by year.
 */
export default function Education() {
  const lang = useLang()
  const t = ui[lang].education
  const { education } = useContent()
  const reduce = useReducedMotion()
  const ref = useRef<HTMLOListElement>(null)

  // the rail fills as the list scrolls through the middle of the viewport
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 75%', 'end 45%'] })
  const fill = useSpring(scrollYProgress, { stiffness: 80, damping: 24, mass: 0.4 })
  // a scale, not a height: the rail fills on the compositor instead of
  // re-laying-out the page on every frame the spring moves
  const scaleY = useTransform(fill, (v) => (reduce ? 1 : v))

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
      variant="rise"
      revealAmount="some"
      panel={false}
    >
      <div className="mx-auto w-full max-w-6xl">
        <p className="mb-12 max-w-2xl font-sans text-[0.9375rem] leading-relaxed text-fg-muted sm:mb-16">{t.intro}</p>

        <ol ref={ref} className="relative">
          {/* the rail, and the part of it already read */}
          <span aria-hidden className="absolute left-4 top-0 h-full w-px bg-fg/12 md:left-[1.35rem]" />
          <motion.span
            aria-hidden
            style={{ scaleY }}
            className="absolute left-4 top-0 h-full w-px origin-top bg-linear-to-b from-duck via-fg to-transparent md:left-[1.35rem]"
          />

          {education.map((ch, i) => {
            const n = count(ch.from, ch.to)
            const last = i === education.length - 1
            const num = String(i + 1).padStart(2, '0')
            return (
              <li key={ch.title} className={`relative pl-11 md:grid md:grid-cols-[17rem_minmax(0,1fr)] md:gap-10 md:pl-0 ${last ? '' : 'pb-16 md:pb-28'}`}>
                {/* left: sticks beside its chapter while that chapter scrolls */}
                <div className="hidden self-start md:sticky md:top-32 md:flex md:items-start md:gap-5">
                  {/* the node: the school's crest on a paper disc, so every crest reads on both themes */}
                  <motion.span
                    aria-hidden
                    initial={{ scale: 0.6, opacity: 0.4 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ amount: 'all', margin: '-25% 0px -55% 0px' }}
                    transition={{ duration: 0.4 }}
                    className={`relative mt-1 grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full border bg-[#f3f0e8] ${
                      last ? 'border-duck shadow-[0_0_18px_rgb(245_190_91/0.6)]' : 'border-fg/40'
                    }`}
                  >
                    {ch.logo ? (
                      <Image src={ch.logo} alt="" width={40} height={40} sizes="44px" className="h-9 w-9 object-contain" />
                    ) : (
                      <span className="font-mono text-[0.6875rem] font-bold text-[#111]">{num}</span>
                    )}
                  </motion.span>
                  <div className="flex flex-col gap-1 pt-1">
                    <span className="font-mono text-[0.625rem] uppercase tracking-[0.3em] text-fg-dim">
                      {t.chapter} {num}
                    </span>
                    <span className="font-crt text-4xl leading-none text-fg/60 lg:text-5xl">
                      {ch.years.replace(/present/i, t.present)}
                    </span>
                    <span className="font-mono text-[0.625rem] uppercase tracking-[0.2em] text-fg-muted">{ch.stage}</span>
                  </div>
                </div>

                {/* the node, on a phone: the chapter's number, not the crest -
                    the crest already sits inline beside the school below, and
                    showing it twice on one screen reads as a mistake. Same
                    arrival as the desktop node, centred on the rail. */}
                <motion.span
                  aria-hidden
                  initial={{ scale: 0.6, opacity: 0.4 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  // not the desktop node's band: that one sits in a sticky
                  // column and dwells inside it, while this one scrolls past
                  // with the chapter - a flick clears a 20%-tall band without
                  // ever satisfying it, and the node stays half-drawn. Once,
                  // when most of it has arrived.
                  viewport={{ once: true, amount: 0.8 }}
                  transition={{ duration: 0.4 }}
                  className={`absolute left-0 top-0 grid h-8 w-8 place-items-center rounded-full border bg-[#f3f0e8] md:hidden ${
                    last ? 'border-duck shadow-[0_0_18px_rgb(245_190_91/0.6)]' : 'border-fg/40'
                  }`}
                >
                  <span className="font-mono text-[0.625rem] font-bold text-[#111]">{num}</span>
                </motion.span>

                {/* the years, on a phone, above the content */}
                <div className="mb-4 flex h-8 items-center gap-3 md:hidden">
                  <span className="font-mono text-[0.625rem] uppercase tracking-[0.3em] text-fg-dim">
                    {t.chapter} {num}
                  </span>
                  <span className="font-crt text-3xl leading-none text-fg/60">{ch.years.replace(/present/i, t.present)}</span>
                </div>

                {/* right: the chapter */}
                <motion.div
                  initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="relative"
                >
                  {/* the chapter number, faded, behind */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -top-6 right-0 select-none font-crt text-[6rem] leading-none text-fg/[0.045] sm:text-[8rem]"
                  >
                    {num}
                  </span>

                  <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <span className="font-mono text-[0.6875rem] uppercase tracking-[0.25em] text-fg-dim">{ch.stage}</span>
                      <h3 className="mt-2 max-w-2xl font-sans text-3xl font-bold leading-[1.05] text-fg sm:text-4xl lg:text-5xl">
                        {ch.title}
                      </h3>
                      {/* the school, with its crest (the phone has no sticky column to carry it) */}
                      {ch.href ? (
                        <a
                          href={ch.href}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-4 inline-flex items-center gap-2.5 font-mono text-[0.8125rem] text-fg underline-offset-4 transition-colors hover:text-duck hover:underline"
                        >
                          {ch.logo && <Image src={ch.logo} alt="" width={28} height={28} sizes="28px" className="h-7 w-7 rounded-full bg-[#f3f0e8] object-contain p-0.5 md:hidden" />}
                          ◇ {ch.school} ↗
                        </a>
                      ) : (
                        <span className="mt-4 inline-flex items-center gap-2.5 font-mono text-[0.8125rem] text-fg-muted">
                          {ch.logo && <Image src={ch.logo} alt="" width={28} height={28} sizes="28px" className="h-7 w-7 rounded-full bg-[#f3f0e8] object-contain p-0.5 md:hidden" />}
                          ◇ {ch.school}
                        </span>
                      )}
                    </div>
                    {/* the counts */}
                    <div className="grid min-w-[11rem] shrink-0 grid-cols-2 rounded-lg border border-fg/15 text-center lg:grid-cols-1">
                      <div className="border-r border-fg/15 p-3 lg:border-b lg:border-r-0">
                        <p className="font-crt text-3xl leading-none text-duck">{n}</p>
                        <p className="mt-1.5 font-mono text-[0.625rem] uppercase tracking-[0.2em] text-fg-dim">{t.signalsShort}</p>
                      </div>
                      <div className="p-3">
                        <p className="font-crt text-3xl leading-none text-fg">{ch.focus.length}</p>
                        <p className="mt-1.5 font-mono text-[0.625rem] uppercase tracking-[0.2em] text-fg-dim">{t.focusShort}</p>
                      </div>
                    </div>
                  </div>

                  <p className="relative mt-7 max-w-3xl font-sans text-[0.9375rem] leading-7 text-fg/80">{ch.summary}</p>

                  {/* the three pillars */}
                  <div className="relative mt-8 grid gap-4 sm:grid-cols-3">
                    {ch.pillars.map((p, k) => (
                      <div key={p.label} className="border-t border-fg/15 pt-4">
                        <span className="mb-3 grid h-8 w-8 place-items-center rounded-full bg-fg font-mono text-[0.625rem] font-bold text-bg">
                          {k + 1}
                        </span>
                        <p className="font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-fg-dim">{p.label}</p>
                        <p className="mt-2 font-sans text-[0.875rem] leading-relaxed text-fg/75">{p.text}</p>
                      </div>
                    ))}
                  </div>

                  {ch.achievements.length > 0 && (
                    <div className="relative mt-7 rounded-xl border border-fg/15 bg-panel/50 p-5">
                      <p className="mb-3 font-mono text-[0.625rem] uppercase tracking-[0.3em] text-fg-dim">{t.achievements}</p>
                      <ul className="grid gap-2 sm:grid-cols-2">
                        {ch.achievements.map((a) => (
                          <li key={a} className="flex gap-2 font-sans text-[0.875rem] leading-relaxed text-fg/85">
                            <span aria-hidden className="shrink-0 font-mono text-duck">
                              ✓
                            </span>
                            {a}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {ch.quote && (
                    <p className="relative mt-7 border-l-2 border-duck/70 pl-4 font-sans text-[0.9375rem] italic leading-relaxed text-fg-muted">
                      “{ch.quote}”
                    </p>
                  )}

                  <div className="relative mt-6 flex flex-wrap items-center gap-2">
                    {ch.focus.map((f) => (
                      <span key={f} className="rounded-sm border border-fg/18 px-2 py-0.5 font-mono text-[0.6875rem] text-fg/75">
                        {f}
                      </span>
                    ))}
                    <span className="ml-auto font-mono text-[0.625rem] uppercase tracking-[0.2em] text-fg-dim">
                      {n > 0 ? fmt(t.signals, { n }) : t.none}
                    </span>
                  </div>
                </motion.div>
              </li>
            )
          })}
        </ol>
      </div>
    </GlassSection>
  )
}
