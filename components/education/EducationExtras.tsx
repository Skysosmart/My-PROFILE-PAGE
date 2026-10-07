'use client'

import { Fragment } from 'react'
import Image from 'next/image'
import { motion, useReducedMotion } from 'motion/react'
import Barcode from '@/components/ui/Barcode'
import Duck from '@/components/duck/Duck'
import type { Chapter, Moment } from '@/data/portfolio'
import { ui } from '@/data/ui'
import { bestCertForMoment, coverOf } from '@/lib/certs'

const EASE = [0.16, 1, 0.3, 1] as const
type T = (typeof ui)['en']['education']

/**
 * EDUCATION.SUMMARY: the current chapter as a taped spec sheet. Every row is
 * read off that chapter (and the profile's location); a field the data does
 * not have is left out - there is no programme or field of study on record,
 * so there is no row for one.
 */
export function EducationSummary({ ch, location, t }: { ch: Chapter; location?: string; t: T }) {
  const rows: [string, string][] = (
    [
      [t.summary.level, ch.stage],
      [t.summary.school, ch.school],
      [t.summary.location, location],
      [t.summary.period, ch.years.replace(/present/i, t.present)],
    ] as [string, string | undefined][]
  ).filter((r): r is [string, string] => Boolean(r[1]))
  return (
    <div className="relative rotate-[1.5deg] motion-reduce:rotate-0">
      <span aria-hidden className="absolute -top-2.5 left-1/2 z-10 h-5 w-20 -translate-x-1/2 -rotate-2 bg-[#e3d6b8]/85" />
      <div className="rounded-[3px] border border-[#111]/45 bg-white px-5 pb-4 pt-6 font-mono text-[0.8125rem] text-[#111] shadow-[6px_6px_0_#111]">
        <p className="border-b border-dashed border-[#111]/50 pb-2 font-bold uppercase tracking-[0.08em]">{t.summary.title}</p>
        <dl className="m-0 grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 py-3">
          {rows.map(([k, v]) => (
            <Fragment key={k}>
              <dt className="uppercase text-[#111]/55 th:normal-case">{k}</dt>
              <dd className="m-0 font-semibold">{v}</dd>
            </Fragment>
          ))}
        </dl>
        <div className="flex items-end justify-between gap-3 border-t border-dashed border-[#111]/40 pt-3">
          <span className="font-bold tracking-[0.2em]">ZARUTECH</span>
          <Barcode className="block h-6 w-20" />
        </div>
      </div>
    </div>
  )
}

// the moments from these school years that have photographs; the line under
// each is its certificate's real result and issuer, or nothing
const HIGHLIGHTS = ['inewgen', 'codekit', 'makex', 'cyber-bootcamp', 'act-brand-ambassador']
const TILT = ['-rotate-[1.6deg]', 'rotate-[1deg]', '-rotate-[0.6deg]', 'rotate-[1.4deg]', '-rotate-[1.1deg]']

export function EducationHighlights({ moments, t }: { moments: Record<string, Moment>; t: T }) {
  const reduce = useReducedMotion()
  const items = HIGHLIGHTS.filter((k) => moments[k]?.photos.length)
  return (
    <section aria-labelledby="edu-highlights" className="mt-20 md:mt-24">
      <h3 id="edu-highlights" className="font-mono text-[1.25rem] font-bold uppercase tracking-[0.06em] text-fg th:tracking-normal sm:text-[1.5rem]">
        <span className="text-accent-text">$</span> {t.highlights.title}
      </h3>
      <p className="mt-1.5 font-sans text-[0.9375rem] text-fg-muted">{t.highlights.sub}</p>

      <div className="mt-8 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-6">
        <ul className="m-0 grid list-none grid-cols-2 gap-5 p-0 sm:grid-cols-3 lg:grid-cols-5">
          {items.map((k, i) => {
            const m = moments[k]
            const cert = bestCertForMoment(k)
            const line = cert ? [cert.result, cert.issuer].filter(Boolean).join(' · ') : ''
            return (
              <motion.li
                key={k}
                initial={reduce ? false : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.55, delay: reduce ? 0 : i * 0.06, ease: EASE }}
              >
                <figure
                  className={`m-0 border border-[#111]/40 bg-white p-1.5 pb-2.5 shadow-[3px_3px_0_#111] transition-[translate,rotate] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-[3px] hover:rotate-0 motion-reduce:rotate-0 motion-reduce:transition-none ${TILT[i % TILT.length]}`}
                >
                  <Image
                    src={`/moments/${k}/${coverOf(m)}`}
                    alt={m.label}
                    width={360}
                    height={270}
                    sizes="(min-width: 1024px) 16vw, 45vw"
                    className="aspect-[4/3] w-full object-cover transition-transform duration-300"
                  />
                  <figcaption className="px-1 pt-2">
                    <span className="block font-mono text-[0.75rem] font-bold leading-snug text-[#111]">{m.label}</span>
                    {line && <span className="mt-0.5 block font-sans text-[0.75rem] leading-snug text-[#111]/65">{line}</span>}
                  </figcaption>
                </figure>
              </motion.li>
            )
          })}
        </ul>
        {/* one duck, at the end of the road */}
        <div className="relative hidden xl:block">
          <span className="absolute -top-16 right-full mr-[-2rem] whitespace-pre-line rounded-[50%] border-2 border-[#111] bg-white px-4 py-2 text-center font-hand text-[0.875rem] leading-[1.15] text-[#111]">
            {t.duck}
          </span>
          <Duck pose="thumbs" width={150} parallax={4} />
        </div>
      </div>
    </section>
  )
}
