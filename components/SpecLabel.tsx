'use client'

import { Fragment, useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'motion/react'
import Barcode from '@/components/ui/Barcode'
import QrCode from '@/components/ui/QrCode'
import Typed from '@/components/ui/Typed'
import { codes } from '@/data/codes'
import { education, projects } from '@/data/portfolio'
import { ui } from '@/data/ui'
import { certStats } from '@/lib/certs'
import { useContent } from '@/lib/use-content'
import { useLang } from '@/lib/use-lang'

/**
 * The label on the back of the device. A cream sticker with black ink, the
 * same object on both themes: the ZaruTech mark, the model (the handle),
 * the revision (the day of the build), the spec rows, the rating strip with
 * the numbers counted off the data, and a foot with a real Code 128 of the
 * handle, the serial, the marks, and a QR that opens the résumé.
 *
 * It prints when it scrolls into view: the keys are pre-printed, the values
 * type in top to bottom, then the barcode draws and the QR develops.
 * Reduced motion prints it whole.
 */
const SPEED = 12 // ms per glyph
const SUB = 4 // the fine print, faster
const GAP = 90 // ms between values
const HEAD = 250 // ms after the section's rise

const initials = (s: string) =>
  s
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

/** the print order and its clock: each value starts when the one before it ends */
function timeline(steps: { id: string; text: string; speed: number }[]) {
  const start = new Map<string, number>()
  let at = HEAD
  for (const s of steps) {
    start.set(s.id, at)
    at += s.text.length * s.speed + GAP
  }
  return { start, end: at }
}

export default function SpecLabel() {
  const lang = useLang()
  const t = ui[lang]
  const p = t.profile
  const { profile, player } = useContent()
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const on = useInView(ref, { once: true, amount: 0.3 })

  const rev = process.env.NEXT_PUBLIC_BUILT ?? 'dev'
  // the serial is derived, so it cannot go stale: the school, the year it
  // started, the type (the English data on purpose: initials of Thai are noise)
  const last = education[education.length - 1]
  const serial = `${initials(last.school)}-${last.from}-${profile.mbti.type}`

  // `art` is the drawing that stands in a row, printed in the same ink
  const rows: { key: string; value: string; sub?: string; dot?: boolean; art?: { src: string; w: number; h: number } }[] = [
    { key: p.type, value: player.role.toUpperCase() },
    {
      key: p.core,
      value: `${profile.mbti.type} · ${profile.mbti.name}`.toUpperCase(),
      sub: profile.mbti.description,
      art: { src: '/duck/suit-print.png', w: 480, h: 910 },
    },
    { key: p.input, value: profile.stack.join(' · ').toUpperCase() },
    { key: p.output, value: `${projects.length} ${t.stats.projects}`.toUpperCase() },
    { key: p.origin, value: `${profile.location} · ${profile.school}`.toUpperCase() },
    { key: p.status, value: profile.status.toUpperCase(), dot: true },
  ]
  const { start, end } = timeline([
    { id: 'model', text: codes.handle, speed: 36 },
    { id: 'rev', text: rev, speed: 24 },
    ...rows.flatMap((r, k) => [
      { id: `v${k}`, text: r.value, speed: SPEED },
      ...(r.sub ? [{ id: `s${k}`, text: r.sub, speed: SUB }] : []),
    ]),
  ])
  const rating = [
    { n: certStats.total, label: t.stats.certificates },
    { n: certStats.gold, label: t.stats.gold },
    { n: certStats.national, label: t.stats.national },
    ...(certStats.intl > 0 ? [{ n: certStats.intl, label: t.stats.international }] : []),
    { n: projects.length, label: t.stats.projects },
  ]
  const ratingAt = (i: number) => end + i * 140
  const barcodeAt = end + rating.length * 140 + 200
  const qrAt = barcodeAt + 450

  const marks = [
    { glyph: 'CTF', title: p.marks.ctf },
    { glyph: '3D', title: p.marks.print },
    { glyph: 'TH/EN', title: p.marks.lang },
    { glyph: '♻', title: p.marks.reuse },
  ]

  return (
    <div ref={ref} className="spec-label relative rounded-md bg-[#f3f0e8] p-4 text-[#111] sm:p-6">
      {/* header: the mark, the model, the revision */}
      <div className="flex items-start justify-between gap-4 border-b border-[#111]/20 pb-4">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          {/* a plain img: next/image would re-encode the 1-bit halftone into mush */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/duck/hacker-print.png"
            alt=""
            width={480}
            height={454}
            draggable={false}
            className="h-20 w-auto shrink-0 select-none sm:h-24"
          />
          <div className="flex min-w-0 flex-col">
            <span className="font-pixel text-[0.5rem] tracking-[0.25em]">ZARUTECH</span>
            <span className="mt-2 font-mono text-[0.5625rem] uppercase tracking-[0.3em] text-[#111]/50">{p.model}</span>
            <span className="font-crt text-3xl leading-none sm:text-4xl">
              <Typed text={codes.handle} on={on} delay={start.get('model')} speed={36} />
            </span>
          </div>
        </div>
        <div className="shrink-0 text-right font-mono text-[0.625rem] uppercase tracking-[0.2em]">
          <span className="block text-[#111]/50">{p.rev}</span>
          <span className="block font-semibold">
            <Typed text={rev} on={on} delay={start.get('rev')} speed={24} />
          </span>
        </div>
      </div>

      {/* the spec rows: keys pre-printed, values typed */}
      <dl className="mt-4 grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2.5 font-mono text-[0.75rem] leading-snug sm:gap-x-6 sm:text-[0.8125rem]">
        {rows.map((r, k) => (
          <Fragment key={r.key}>
            <dt className="pt-0.5 text-[0.5625rem] uppercase tracking-[0.3em] text-[#111]/50 sm:text-[0.625rem]">{r.key}</dt>
            <dd className="m-0 min-w-0">
              {/* a row that carries a drawing puts it beside the text rather
                  than floating it: Typed is an inline-block at full width, so
                  it cannot wrap around a float - it clears it */}
              <div className={r.art ? 'flex items-start gap-3 sm:gap-4' : undefined}>
                <div className={r.art ? 'min-w-0 flex-1' : undefined}>
                  {r.dot && <span aria-hidden className="mr-2 inline-block h-2 w-2 rounded-full bg-duck align-middle" />}
                  <Typed text={r.value} on={on} delay={start.get(`v${k}`)} className="font-semibold" />
                  {r.sub && (
                    <span className="mt-1 block text-[0.6875rem] leading-relaxed text-[#111]/65">
                      <Typed text={r.sub} on={on} delay={start.get(`s${k}`)} speed={SUB} caret={false} />
                    </span>
                  )}
                </div>
                {r.art && (
                  // a plain img for the same reason as the mark above
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={r.art.src}
                    alt=""
                    width={r.art.w}
                    height={r.art.h}
                    draggable={false}
                    className="h-16 w-auto shrink-0 select-none sm:h-20"
                  />
                )}
              </div>
            </dd>
          </Fragment>
        ))}
      </dl>

      {/* the rating strip: the numbers, counted off the data */}
      <span className="mt-5 block text-[0.5625rem] uppercase tracking-[0.3em] text-[#111]/50 sm:text-[0.625rem]">{p.rating}</span>
      <div className={`mt-1.5 grid border-y border-[#111]/20 py-3 ${rating.length > 4 ? 'grid-cols-5' : 'grid-cols-4'}`}>
        {rating.map((r, i) => (
          <div key={r.label} className={`flex flex-col items-center gap-1.5 px-1 ${i ? 'border-l border-[#111]/15' : ''}`}>
            <span className="font-crt text-3xl leading-none sm:text-4xl">
              <Typed text={String(r.n)} on={on} delay={ratingAt(i)} speed={90} caret={false} />
            </span>
            <span className="max-w-full bg-duck px-1 py-0.5 text-center font-mono text-[0.4375rem] uppercase leading-[1.2] th:leading-[1.45] tracking-[0.1em] sm:px-1.5 sm:text-[0.5rem] sm:tracking-[0.15em]">
              {r.label}
            </span>
          </div>
        ))}
      </div>

      {/* the foot, under a perforation: barcode, serial, marks, the QR to the CV */}
      <div className="mt-4 flex items-end gap-4 border-t border-dashed border-[#111]/30 pt-4 sm:gap-6">
        <div className="min-w-0 flex-1">
          <motion.div
            initial={reduce ? false : { clipPath: 'inset(0 100% 0 0)' }}
            animate={on ? { clipPath: 'inset(0 0% 0 0)' } : undefined}
            transition={{ delay: barcodeAt / 1000, duration: 0.5, ease: 'linear' }}
          >
            <Barcode className="block h-10 w-full sm:h-12" />
          </motion.div>
          <div className="mt-1.5 flex flex-wrap items-baseline justify-between gap-x-4 font-mono text-[0.5625rem] tracking-[0.2em] text-[#111]/70 sm:text-[0.625rem]">
            <span>{codes.handle}</span>
            <span>
              <span className="text-[#111]/45">{p.serial} </span>
              {serial}
            </span>
          </div>
        </div>
        <div className="flex shrink-0 items-end gap-3 sm:gap-4">
          <ul className="hidden grid-cols-2 gap-1 sm:grid" aria-label="marks">
            {marks.map((m) => (
              <li
                key={m.glyph}
                title={m.title}
                className="grid h-7 w-10 place-items-center border border-[#111]/45 font-mono text-[0.5625rem] font-bold tracking-[0.05em]"
              >
                {m.glyph}
              </li>
            ))}
          </ul>
          <a
            href="/resume.pdf"
            target="_blank"
            rel="noreferrer"
            aria-label={p.scanCv}
            title={p.scanCv}
            data-cursor-label="pdf ↗"
            className="block border border-[#111]/25 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111]"
          >
            <motion.div
              initial={reduce ? false : { opacity: 0 }}
              animate={on ? { opacity: 1 } : undefined}
              transition={{ delay: qrAt / 1000, duration: 0.45 }}
            >
              <QrCode className="block h-20 w-20 sm:h-24 sm:w-24" />
            </motion.div>
          </a>
        </div>
      </div>

      {/* the base line */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-[#111]/20 pt-2 font-mono text-[0.5rem] uppercase tracking-[0.3em] text-[#111]/55 sm:text-[0.5625rem]">
        <span>{p.madeIn}</span>
        <span>ZaruTech © {rev.slice(0, 4)}</span>
      </div>
    </div>
  )
}
