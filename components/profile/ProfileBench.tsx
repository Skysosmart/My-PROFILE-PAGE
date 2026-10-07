'use client'

import { useMemo } from 'react'
import Image from 'next/image'
import { motion, useReducedMotion } from 'motion/react'
import InkNote from '@/components/ui/InkNote'
import { setup } from '@/data/portfolio'
import { ui } from '@/data/ui'
import { useContent } from '@/lib/use-content'
import { useLang } from '@/lib/use-lang'

/**
 * The bench under the system profile: three panels that answer three quick
 * questions - what the process looks like (the prints), what Sky works on
 * (the packing list) and where the time goes (the readout). The stack sheet
 * that used to sit beside them is section 03 now (components/profile/
 * StackSheet.tsx).
 *
 * Each one is a different object on purpose: a pile of photographs, a flat
 * packing list and a strip of bars. Everything on them is real: the levels
 * are data/portfolio.ts `skills`, the photographs are the site's own, and a
 * print with no picture is left out rather than faked.
 *
 * `lg` and up is two panels, the right one holding the devices over the
 * focus readout; a phone stacks them.
 */
const EASE = [0.16, 1, 0.3, 1] as const
const PANEL = 'min-w-0 border border-[#111]/10 bg-white/45 p-5 sm:p-6'

export default function ProfileBench() {
  const t = ui[useLang()].profile.bench
  return (
    // two panels of slightly lighter paper on the grid, the right one split
    // in two; the gap between them is the page showing through
    <div className="mt-16 grid w-full grid-cols-1 gap-5 lg:grid-cols-[minmax(0,58fr)_minmax(0,42fr)] min-[90rem]:gap-6">
      <div className={PANEL}>
        <WorkEnvironment t={t.env} />
      </div>
      <div className={`${PANEL} flex flex-col !p-0`}>
        <div className="p-5 sm:p-6">
          <Devices t={t.devices} />
        </div>
        <div className="border-t border-[#111]/12 p-5 sm:p-6">
          <Focus t={t.focus} />
        </div>
      </div>
    </div>
  )
}

/** the shared heading: an accent rule, the title in mono, a plain line under it */
function Head({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="mb-5 border-l-[3px] border-accent pl-3">
      <h3 className="font-mono text-[0.9375rem] font-bold uppercase tracking-[0.14em] text-fg th:tracking-normal">{title}</h3>
      <p className="mt-0.5 font-sans text-[0.875rem] text-fg-muted th:leading-[1.7]">{sub}</p>
    </div>
  )
}

/* ---------------------------------------------------------- 02 environment */

// slightly off, each its own way: a handful of prints put down, not aligned
const TILT = ['-rotate-[2.5deg]', 'rotate-[1.4deg]', '-rotate-[0.8deg]', 'rotate-[2deg]']

function WorkEnvironment({ t }: { t: (typeof ui)['en']['profile']['bench']['env'] }) {
  return (
    <section>
      <Head title={t.title} sub={t.sub} />
      <div className="relative px-1">
        {/* the desk print: tape on the top edge, a white border, a hard shadow */}
        <figure className="relative m-0 -rotate-[0.6deg] rounded-[2px] border border-[#111]/45 bg-white p-2.5 shadow-[6px_6px_0_#111] motion-reduce:rotate-0">
          <span aria-hidden className="absolute -top-3 left-1/2 z-10 h-5 w-24 -translate-x-1/2 rotate-2 bg-[#e3d6b8]/85" />
          {setup.desk ? (
            <Image src={setup.desk} alt={t.deskAlt} width={1200} height={2134} sizes="(min-width: 80rem) 440px, (min-width: 64rem) 60vw, 92vw" className="aspect-4/3 w-full object-cover object-[50%_62%]" />
          ) : (
            // the slot, until the real photograph arrives (data/portfolio.ts `setup.desk`)
            <div className="grid aspect-4/3 w-full place-items-center bg-[repeating-linear-gradient(135deg,rgba(17,17,17,0.06)_0_1px,transparent_1px_10px)] outline outline-1 -outline-offset-1 outline-[#111]/15">
              <span className="font-mono text-[0.75rem] uppercase tracking-[0.14em] text-fg-muted th:tracking-normal">{t.deskSoon}</span>
            </div>
          )}
        </figure>
        {/* the hand only points at the desk once there is a desk to point at */}
        {setup.desk && (
          <InkNote arrow="down-left" delay={0.4} className="absolute -top-14 right-2" arrowClassName="-bottom-9 -left-10" arrowWidth="w-10">
            {t.note}
          </InkNote>
        )}

        {/* the small prints, dropped over the desk print's bottom edge */}
        <ul className="relative z-10 -mt-10 grid grid-cols-4 gap-2 px-1 sm:-mt-14 sm:gap-3">
          {setup.prints.map((p, i) => (
            <li key={p.key}>
              <figure
                className={`m-0 rounded-[2px] border border-[#111]/45 bg-white p-1.5 pb-1 shadow-[3px_3px_0_#111] transition-[translate,rotate,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:rotate-0 hover:shadow-[5px_5px_0_#111] motion-reduce:rotate-0 motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${TILT[i % TILT.length]}`}
              >
                <Image src={p.src} alt={t.prints[p.key] ?? p.key} width={300} height={300} sizes="(min-width: 80rem) 110px, 24vw" className="aspect-square w-full object-cover" />
                <figcaption className="pt-1 text-center font-hand text-[0.875rem] leading-tight text-fg sm:text-[0.9375rem]">{t.prints[p.key] ?? p.key}</figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/* -------------------------------------------------------------- 03 devices */

function Devices({ t }: { t: (typeof ui)['en']['profile']['bench']['devices'] }) {
  return (
    <section>
      <Head title={t.title} sub={t.sub} />
      {/* a flat packing list with the one machine drawn beside it */}
      <div className="flex items-center gap-3">
        <ul className="flex min-w-0 flex-1 flex-col gap-2.5">
          {t.items.map((d) => (
            <li key={d.name} className="grid grid-cols-[1.125rem_minmax(0,1fr)] gap-x-1">
              <span aria-hidden className="font-mono text-[0.875rem] font-bold leading-snug text-[#111]">✓</span>
              <span className="font-mono text-[0.8125rem] font-semibold leading-snug text-fg">{d.name}</span>
              <span className="col-start-2 font-mono text-[0.6875rem] leading-snug text-fg-muted th:font-sans th:text-[0.75rem] th:leading-[1.6]">{d.detail}</span>
            </li>
          ))}
        </ul>
        <svg aria-hidden viewBox="0 0 64 44" fill="none" stroke="#111" strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round" className="hidden h-auto w-[28%] max-w-[7rem] shrink-0 min-[420px]:block">
          <path d="M14 6.5C14 5 15 4 16.5 4L53.5 4.6C55 4.6 56 5.6 56 7.2L54.4 30.4L13.4 30.1Z" fill="#fff" />
          <path d="M18 9L51 9.5L49.8 27L17.4 26.7Z" strokeWidth={0.9} />
          <path d="M22 13l14 13M30 11l16 15M20 20l8 7" strokeWidth={0.6} opacity={0.45} />
          <path d="M5 32L62 31.5L58 38.6C57.5 39.5 56.7 40 55.7 40L10 40.3C9 40.3 8.2 39.8 7.8 38.9Z" fill="#fff" />
          <path d="M27 35.3L38 35.2" />
        </svg>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------- 04 focus */

function Focus({ t }: { t: (typeof ui)['en']['profile']['bench']['focus'] }) {
  const { skills } = useContent()
  const reduce = useReducedMotion()
  // no time log exists, so no percentages: each area is the mean of Sky's own
  // 1-5 levels across its group, ranked. The bar is that mean out of five.
  const rows = useMemo(
    () =>
      skills
        .map((g) => ({ key: g.key, mean: g.skills.reduce((s, k) => s + k.level, 0) / g.skills.length }))
        .sort((a, b) => b.mean - a.mean)
        // a tie is a tie: two areas with the same mean share a rank
        .map((r, _, all) => ({ ...r, rank: [...new Set(all.map((x) => x.mean))].indexOf(r.mean) })),
    [skills],
  )

  return (
    <section>
      <Head title={t.title} sub={t.sub} />
      {/* a flat readout: label, bar, rank on one line */}
      <ul className="flex flex-col gap-2.5">
        {rows.map((r, i) => (
          <li key={r.key} className="grid grid-cols-[5.75rem_minmax(0,1fr)_4.75rem] items-center gap-x-2.5">
            <span className="truncate font-mono text-[0.75rem] font-semibold text-fg th:font-sans">{t.areas[r.key] ?? r.key}</span>
            <span className="relative h-2.5 bg-[#111]/[0.08]">
              <motion.span
                initial={reduce ? false : { scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: reduce ? 0 : 0.7, delay: reduce ? 0 : i * 0.08, ease: EASE }}
                style={{ width: `${(r.mean / 5) * 100}%` }}
                // only the top area takes the section's colour; the rest are ink
                className={`absolute inset-y-0 left-0 origin-left ${r.rank === 0 ? 'bg-accent outline outline-1 outline-[#111]' : 'bg-[#111]'}`}
              />
            </span>
            <span className="text-right font-mono text-[0.625rem] uppercase tracking-[0.08em] text-fg-muted th:tracking-normal">
              {t.ranks[Math.min(r.rank, t.ranks.length - 1)]}
            </span>
          </li>
        ))}
      </ul>
      <InkNote delay={0.3} className="mt-3 flex justify-end">
        {t.note}
      </InkNote>
    </section>
  )
}
