'use client'

import { Fragment, useEffect, useRef, useState, type ReactNode } from 'react'
import Image from 'next/image'
import { motion, useInView, useReducedMotion } from 'motion/react'
import Barcode from '@/components/ui/Barcode'
import SectionHeading from '@/components/ui/SectionHeading'
import PaperClip from '@/components/ui/PaperClip'
import QrCode from '@/components/ui/QrCode'
import Typed from '@/components/ui/Typed'
import ProfileBench from '@/components/profile/ProfileBench'
import { codes } from '@/data/codes'
import { assets, education, projects } from '@/data/portfolio'
import { ZARU_MARK } from '@/data/zaru-mark'
import { fmt, ui, type Step } from '@/data/ui'
import { certStats } from '@/lib/certs'
import { useContent } from '@/lib/use-content'
import { useLang } from '@/lib/use-lang'
import { useTint } from '@/lib/tint'

/**
 * 00 · SYSPROFILE - `$ whoami`. The machine's own readout, laid out like a
 * desk: on the left a terminal window running neofetch (the print of Sky,
 * the pixel duck, the spec rows and the numbers counted off the data, with
 * the barcode and the QR to the CV in its foot); on the right the leaflet
 * from the box (how to play the page), the system spec card taped over its
 * corner, and the duck at his laptop. Under both, the bench (ProfileBench):
 * the work environment, the devices and the focus readout.
 *
 * This replaced the spec label and the three clipped quick-start notes
 * (SpecLabel.tsx, QuickStart.tsx, both kept). Every number is counted, never
 * typed: projects, certificates, awards and skills come from data/.
 *
 * Desktop puts the window and the leaflet side by side (56 / 44). Below 1440
 * the window takes the full width and the leaflet column sits under it; a
 * phone stacks everything and the window's insides stack with it.
 */
const EASE = [0.16, 1, 0.3, 1] as const

const initials = (s: string) =>
  s
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

// backticks become keycaps
function keyed(s: string): ReactNode {
  return s.split(/`([^`]+)`/).map((part, i) =>
    i % 2 === 1 ? (
      <code key={i} className="whitespace-nowrap rounded-xs border border-[#111]/20 bg-[#111]/[0.05] px-1 py-px font-mono text-[0.85em]">
        {part}
      </code>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  )
}

function useClock() {
  const [time, setTime] = useState('')
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('en-GB'))
    tick()
    const id = window.setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])
  return time
}

export default function SystemProfile() {
  const lang = useLang()
  const t = ui[lang].profile.top
  const ref = useTint('profile')

  return (
    <section ref={ref} id="profile" className="relative isolate scroll-mt-28 overflow-x-clip px-[clamp(16px,4vw,64px)] py-14 sm:py-20">
      <div className="mx-auto w-full max-w-[92.5rem]">
        {/* ── header, top-left ─────────────────────────────────────────── */}
        <SectionHeading index="00" label={t.eyebrow} command={t.command} subtitle={t.subtitle}>
          {/* the pen's aside over the window: three short lines, tilted, and
              a long arrow of its own down at the window */}
          <SpecsNote text={t.noteHeader} />
        </SectionHeading>

        <div className="grid grid-cols-1 gap-x-12 gap-y-14 min-[90rem]:grid-cols-[minmax(0,58fr)_minmax(0,42fr)]">
          <Neofetch />
          <Leaflet />
        </div>

        <ProfileBench />
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────── the neofetch window */

function Neofetch() {
  const lang = useLang()
  const t = ui[lang].profile.top
  const p = ui[lang].profile
  const { player, skills, profile } = useContent()
  const reduce = useReducedMotion()
  const time = useClock()
  const box = useRef<HTMLDivElement>(null)
  const on = useInView(box, { once: true, amount: 0.3 })

  const rev = process.env.NEXT_PUBLIC_BUILT ?? 'dev'
  const last = education[education.length - 1]
  const serial = `${initials(last.school)}-${last.from}-${profile.mbti.type}`
  const skillCount = skills.reduce((n, g) => n + g.skills.length, 0)

  const rows: [string, ReactNode][] = [
    [t.keys.name, player.name],
    [t.keys.role, <span key="r" className="flex flex-col">{player.roles.map((r) => <span key={r}>{r}</span>)}</span>],
    [t.keys.base, profile.location],
    [t.keys.site, 'zarutech.dev'],
    [t.keys.handle, codes.handle],
    [t.keys.os, t.os],
  ]
  const stats = [
    { n: projects.length, label: t.stats.projects },
    { n: certStats.total, label: t.stats.certificates },
    { n: certStats.national + certStats.intl, label: t.stats.awards },
    { n: skillCount, label: t.stats.skills },
  ]
  const hero = ui[lang].hero

  return (
    <motion.figure
      ref={box}
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.7, ease: EASE }}
      className="m-0 min-w-0 self-start rounded-[4px] border border-[#111] bg-white text-[#111] shadow-[6px_6px_0_#111]"
    >
      {/* title bar */}
      <div className="flex items-center gap-2 border-b border-[#111]/15 px-3.5 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-3 min-w-0 flex-1 truncate font-mono text-[0.8125rem] sm:text-[0.875rem]">nonthanaphong@exe:~$ neofetch</span>
        <span className="shrink-0 font-mono text-[0.75rem] tabular-nums tracking-[0.1em]">
          {/* Thailand time, whatever the reader's language */}
          {time} <span className="font-bold">TH</span>
        </span>
      </div>

      {/* body: the print, the duck, the readout */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-6 p-4 sm:p-6 md:grid-cols-[minmax(0,12.5rem)_minmax(0,10rem)_minmax(0,1fr)] md:gap-x-5 min-[90rem]:grid-cols-[minmax(0,9.5rem)_minmax(0,7rem)_minmax(0,1fr)] min-[90rem]:gap-x-4">
        {/* the print of Sky, taped down, with the hand saying hello */}
        <div className="relative">
          <div className="relative -rotate-[1.8deg] border border-[#111]/45 bg-white p-2 pb-6 shadow-[4px_4px_0_#111] motion-reduce:rotate-0">
            <span aria-hidden className="absolute -top-2.5 right-6 z-10 h-5 w-16 rotate-3 bg-[#e3d6b8]/85" />
            <Image src={assets.portrait} alt={player.name} width={400} height={500} sizes="(min-width: 768px) 200px, 45vw" className="aspect-4/5 w-full object-cover object-top" />
          </div>
          {/* the hello is a die-cut sticker stuck over the print's lower-left
              corner: a cream paper shape, a bump on top for the arrow, the
              writing in plain ink inside it */}
          <HelloSticker text={t.hi} />
        </div>

        {/* the pixel duck and the signature under him */}
        <div className="flex flex-col items-center justify-center gap-2">
          {/* a plain img: next/image would re-encode the 1-bit halftone into mush */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/duck/hacker-print.png" alt="" width={480} height={454} draggable={false} className="h-auto w-full max-w-[10rem] select-none" />
          <svg viewBox={ZARU_MARK.viewBox} role="img" aria-label="ZaruTech" className="h-auto w-24 -rotate-6 text-[#111]">
            <g transform={ZARU_MARK.transform} fill="currentColor">
              {ZARU_MARK.letters.map((d, i) => (
                <path key={i} d={d} />
              ))}
              <path d={ZARU_MARK.swoosh} />
            </g>
          </svg>
        </div>

        {/* the readout */}
        <div className="col-span-2 min-w-0 md:col-span-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <span className="block font-mono text-[0.75rem] font-bold tracking-[0.25em]">ZARUTECH</span>
              <span className="block font-mono text-[0.6875rem] uppercase tracking-[0.25em] text-[#111]/50">{p.model}</span>
              <span className="block whitespace-nowrap font-crt text-[1.75rem] leading-none sm:text-[2.125rem] min-[90rem]:text-[1.875rem]">
                <Typed text={codes.handle} on={on} delay={300} speed={36} />
              </span>
            </div>
            <div className="shrink-0 text-right font-mono text-[0.75rem] uppercase tracking-[0.15em]">
              <span className="block text-[#111]/50">{p.rev}</span>
              <span className="block font-semibold">{rev}</span>
            </div>
          </div>
          <div className="my-3 border-t border-dashed border-[#111]/35" />
          <dl className="grid grid-cols-[4.75rem_minmax(0,1fr)] gap-x-3 gap-y-1 font-mono text-[0.8125rem] leading-snug">
            {rows.map(([k, v]) => (
              <Fragment key={k}>
                <dt className="uppercase text-[#111]/60">{k}</dt>
                <dd className="m-0 min-w-0 break-words">{v}</dd>
              </Fragment>
            ))}
          </dl>
          {/* the palette: ink, then every section's colour */}
          <div aria-hidden className="mt-4 flex h-3.5 border border-[#111]">
            <span className="flex-[2] bg-[#111]" />
            <span className="flex-1 bg-duck" />
            <span className="flex-1 bg-[rgb(var(--accent-pink))]" />
            <span className="flex-1 bg-[rgb(var(--accent-sky))]" />
            <span className="flex-1 bg-[rgb(var(--accent-violet))]" />
          </div>
          <p className="mt-3 font-mono text-[0.875rem] font-bold">
            {hero.line1} {hero.line2} <span className="text-duck-deep">{hero.line3}</span>
          </p>
        </div>
      </div>

      {/* the foot: the numbers, then the codes */}
      <div className="grid grid-cols-2 border-t border-[#111]/20 sm:grid-cols-4 lg:grid-cols-[repeat(4,minmax(0,1fr))_minmax(0,1.7fr)]">
        {stats.map((s, i) => (
          <div key={s.label[0]} className={`flex flex-col items-center px-2 py-4 text-center ${i % 2 ? 'border-l' : ''} border-[#111]/15 sm:border-l sm:first:border-l-0 ${i > 1 ? 'border-t sm:border-t-0' : ''}`}>
            <span className="font-crt text-[2.25rem] leading-none">{s.n}</span>
            <span className="mt-1.5 font-mono text-[0.6875rem] font-bold uppercase tracking-[0.12em] th:tracking-normal">{s.label[0]}</span>
            <span className="mt-0.5 font-mono text-[0.625rem] leading-tight text-[#111]/60 th:font-sans th:text-[0.6875rem]">
              {fmt(s.label[1], { n: skills.length })}
            </span>
          </div>
        ))}
        <div className="col-span-2 flex items-center gap-3 border-t border-[#111]/15 px-4 py-3 sm:col-span-4 lg:col-span-1 lg:border-l lg:border-t-0">
          <div className="min-w-0 flex-1">
            <Barcode className="block h-9 w-full" />
            <div className="mt-1 flex flex-col font-mono text-[0.5625rem] uppercase leading-[1.5] tracking-[0.12em] text-[#111]/70">
              <span>{codes.handle}</span>
              <span>
                {p.serial} {serial}
              </span>
              <span>{p.madeIn}</span>
            </div>
          </div>
          <a
            href="/resume.pdf"
            target="_blank"
            rel="noreferrer"
            aria-label={p.scanCv}
            title={p.scanCv}
            data-cursor-label="pdf ↗"
            className="block shrink-0 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111]"
          >
            <QrCode className="block h-[4.5rem] w-[4.5rem]" />
          </a>
        </div>
      </div>
    </motion.figure>
  )
}

/* ──────────────────────────────────────────── the header's aside */

function SpecsNote({ text }: { text: string }) {
  const reduce = useReducedMotion()
  const draw = (at: number, d: number) => ({
    initial: { pathLength: reduce ? 1 : 0 },
    whileInView: { pathLength: 1 },
    viewport: { once: true, amount: 0.6 },
    transition: { delay: reduce ? 0 : at, duration: reduce ? 0 : d, ease: 'easeInOut' as const },
  })
  return (
    // the pen is the vivid blue of a reviewer's biro, a step brighter than
    // the section's text cut so it reads as written on, not printed
    <div aria-hidden className="pointer-events-none absolute left-[48%] top-[-0.25rem] hidden items-end gap-1 text-[#1f45e0] lg:flex xl:left-[38%]">
      <svg viewBox="0 0 60 72" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" className="mb-[-2.75rem] h-auto w-[3.75rem] shrink-0">
        <motion.path d="M54 6C40 14 26 30 19 50C17 56 16 60 15.5 64" {...draw(0.75, 0.45)} />
        <motion.path d="M5 51C8.5 55.5 12 60 15.5 65.5C20 61 24.5 57.5 30 54" {...draw(1.15, 0.22)} />
      </svg>
      <motion.p
        initial={reduce ? false : { opacity: 0, y: 6 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ delay: reduce ? 0 : 0.3, duration: 0.5, ease: EASE }}
        className="-rotate-[12deg] whitespace-pre-line text-center font-hand text-[1.625rem] leading-[1.05] th:text-[1.3125rem] th:leading-[1.35]"
      >
        {text}
      </motion.p>
    </div>
  )
}

/* ─────────────────────────────────────────────── the hello sticker */

// One outline: the body that holds the writing, and the lobe that rises out
// of its upper right to hold the arrow. Drawn freehand-ish, so no two edges
// are parallel - a sticker cut with scissors, not a rounded rectangle.
const STICKER =
  'M10 58C6 50 11 43 20 42L44 41C41 33 43 19 52 12C61 5 77 4 86 10C95 16 97 28 91 37L89 41C99 43 107 51 108 62L109 92C109 102 102 109 92 109L22 110C12 110 5 104 5 95Z'

function HelloSticker({ text }: { text: string }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      aria-hidden
      initial={reduce ? false : { opacity: 0, scale: 0.85, rotate: -10 }}
      whileInView={{ opacity: 1, scale: 1, rotate: -3 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ delay: reduce ? 0 : 0.7, type: 'spring', stiffness: 260, damping: 18 }}
      className="pointer-events-none absolute -left-3 top-[54%] z-10 w-[7.25rem] origin-bottom-left sm:-left-5 sm:w-[8.75rem] motion-reduce:!rotate-0"
    >
      <svg viewBox="0 0 114 114" className="block h-auto w-full overflow-visible drop-shadow-[0_2px_3px_rgba(17,17,17,0.18)]">
        <path d={STICKER} fill="#f6f3ea" />
        {/* the arrow, in the lobe, up and right at the face */}
        <g fill="none" stroke="#111" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M52 40C55 30 63 22 77 18" />
          <path d="M68 13.5C71.5 15.5 74.5 16.8 78 17.6C76.4 21 75.6 24.2 75.4 27.6" />
        </g>
      </svg>
      <p className="absolute inset-x-0 bottom-[11%] whitespace-pre-line pl-[16%] font-hand text-[1.3125rem] leading-[1.05] text-[#111] sm:text-[1.625rem] th:text-[1rem] th:leading-[1.3] sm:th:text-[1.1875rem]">
        {text}
      </p>
    </motion.div>
  )
}

/* ─────────────────────── the leaflet, the spec card and the duck */

function Leaflet() {
  const lang = useLang()
  const p = ui[lang].profile
  const t = p.top
  const reduce = useReducedMotion()
  const vars = { n: certStats.total }
  const jump = (id: string) => (e: React.MouseEvent) => {
    const el = document.getElementById(id)
    if (!el) return
    e.preventDefault()
    el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
  }
  const step = (s: Step, n: number) => (
    <li key={n} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-x-1">
      <span className="pt-[0.15em] font-mono text-[0.75rem] tabular-nums text-[#111]/55">{String(n).padStart(2, '0')}</span>
      <span>
        {s.text !== undefined && keyed(fmt(s.text, vars))}
        {s.fine !== undefined && <span className="pointer-coarse:hidden">{keyed(fmt(s.fine, vars))}</span>}
        {s.coarse !== undefined && <span className="hidden pointer-coarse:inline">{keyed(fmt(s.coarse, vars))}</span>}
        {s.to && (
          <>
            {' '}
            <a href={`#${s.to}`} onClick={jump(s.to)} data-cursor-label="jump" className="whitespace-nowrap text-[#111]/50 transition-colors hover:text-[#111]">
              → /{s.to}
            </a>
          </>
        )}
      </span>
    </li>
  )

  return (
    <div className="relative min-w-0 sm:min-h-[46rem]">
      {/* the leaflet: one clipped sheet, slightly off square */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 16, rotate: -3 }}
        whileInView={{ opacity: 1, y: 0, rotate: -1.2 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, delay: 0.2, ease: EASE }}
        className="relative pt-4 sm:w-[60%] motion-reduce:!rotate-0"
      >
        <span aria-hidden className="pointer-events-none absolute left-6 top-0 z-0 text-fg/45">
          <PaperClip side="back" />
        </span>
        <span aria-hidden className="absolute left-1/2 top-2 z-20 h-5 w-24 -translate-x-1/2 -rotate-2 bg-[#e3d6b8]/85" />
        <div className="relative z-10 rounded-[3px] border border-[#111]/45 bg-white px-5 pb-6 pt-8 text-[#111] shadow-[6px_6px_0_#111]">
          <h3 className="mb-4 font-mono text-[0.9375rem] font-bold uppercase tracking-[0.2em] th:tracking-normal">{p.quickStart}</h3>
          <ol className="space-y-3 font-mono text-[0.8125rem] leading-[1.6] th:font-sans th:text-[0.875rem] th:leading-[1.75]">
            {p.steps.map((s, i) => step(s, i + 1))}
          </ol>
        </div>
        <span aria-hidden className="pointer-events-none absolute left-6 top-0 z-20 text-fg/55">
          <PaperClip side="front" />
        </span>
      </motion.div>

      {/* the spec card, taped over the leaflet's right edge */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 16, rotate: 5 }}
        whileInView={{ opacity: 1, y: 0, rotate: 2 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, delay: 0.45, ease: EASE }}
        className="relative z-30 mx-auto mt-10 w-[min(19rem,100%)] sm:absolute sm:right-0 sm:top-14 sm:mt-0 sm:w-[37%] sm:min-w-[14rem] motion-reduce:!rotate-0"
      >
        <span aria-hidden className="absolute -top-2.5 left-1/2 z-10 h-5 w-20 -translate-x-1/2 rotate-2 bg-[#e3d6b8]/85" />
        <div className="rounded-[3px] border border-[#111]/45 bg-white px-5 pb-4 pt-6 text-[#111] shadow-[6px_6px_0_#111]">
          <h3 className="font-mono text-[0.9375rem] font-bold uppercase tracking-[0.2em]">{t.spec.title}</h3>
          <div className="my-3 border-t border-dashed border-[#111]/35" />
          <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1.5 font-mono text-[0.75rem] uppercase">
            {t.spec.rows.map(([k, v]) => (
              <Fragment key={k}>
                <dt className="text-[#111]/60">{k}</dt>
                <dd className="m-0 font-semibold">{v}</dd>
              </Fragment>
            ))}
          </dl>
          <div className="mt-3 flex items-end justify-between gap-3 border-t border-dashed border-[#111]/35 pt-3">
            <span className="font-mono text-[0.75rem] font-bold tracking-[0.2em]">ZARUTECH</span>
            <Barcode className="block h-7 w-24" />
          </div>
        </div>
      </motion.div>

      {/* the duck at his laptop, saying what the whole site says */}
      <div className="relative mt-24 flex justify-end sm:absolute sm:bottom-0 sm:right-0 sm:mt-0">
        <div className="relative">
          {/* the bubble sits over his head, clear of the leaflet's text */}
          <div className="absolute -left-14 -top-20 rotate-[4deg] whitespace-pre-line rounded-[50%] border-2 border-[#111] bg-white px-4 py-2.5 text-center font-hand text-[0.875rem] leading-[1.15] text-[#111]">
            {t.bubble}
            <span aria-hidden className="absolute -bottom-2 right-7 h-3.5 w-3.5 rotate-45 border-b-2 border-r-2 border-[#111] bg-white" />
          </div>
          <svg aria-hidden viewBox="0 0 24 24" className="absolute -left-8 top-10 h-6 w-6 fill-[rgb(var(--accent-sky))] stroke-[#111]" strokeWidth={1.2}>
            <path d="M12 2l2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2z" />
          </svg>
          <svg aria-hidden viewBox="0 0 24 24" className="absolute -right-2 top-2 h-4 w-4 fill-duck">
            <path d="M12 2l2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2z" />
          </svg>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/duck/laptop-light.png" alt="" width={715} height={1003} draggable={false} className="h-auto w-36 select-none sm:w-40" />
        </div>
      </div>
    </div>
  )
}
