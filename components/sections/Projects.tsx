'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import AsciiImage from '@/components/effects/AsciiImage'
import Barcode from '@/components/ui/Barcode'
import InkBubble from '@/components/ui/InkBubble'
import InkNote from '@/components/ui/InkNote'
import SectionHeading from '@/components/ui/SectionHeading'
import { lead, projectSlug, slugify, splitTitle } from '@/lib/projects'
import ProjectTimeline from '@/components/projects/ProjectTimeline'
import type { Project } from '@/data/portfolio'
import { ui } from '@/data/ui'
import { getLenis } from '@/lib/smooth-scroll'
import { watchTint } from '@/lib/tint'
import { useContent } from '@/lib/use-content'
import { useLang } from '@/lib/use-lang'

/**
 * 05 · PROJECTS - the workbench. One project lies open on the desk: its real
 * screenshot in a terminal window (developing from ASCII the moment it is
 * picked), its case file on paper beside it, a BUILD SPEC label stuck over
 * the corner, the laptop duck at the foot. Under the desk, the full story:
 * every project open at once on one line that draws itself as the page
 * scrolls (ProjectTimeline); any of them can be put on the bench.
 *
 * Everything shown is read off the project data. Nothing is filled in where
 * a project has nothing to say: no build.log tab without a `buildLog`, no
 * screenshot for the POS (someone else's product behind a login), no live
 * link without a demo, no spec row without its field. The window's render
 * log runs in step with the ASCII developing, and VIEW CASE STUDY opens the
 * project's own page (app/projects/[slug]).
 *
 * It replaced a scroll-pinned film (one project per screen of scrolling);
 * git has that one.
 */

const EASE = [0.16, 1, 0.3, 1] as const
const pad = (n: number) => String(n).padStart(2, '0')
/** "PDLite - Parkinson's Risk Screening Device" -> name + the line after the dash */
const split = splitTitle
const slug = slugify

type Tab = 'overview' | 'build' | 'outcome'
const TABS: { id: Tab; file: string }[] = [
  { id: 'overview', file: 'overview.md' },
  { id: 'build', file: 'build.log' },
  { id: 'outcome', file: 'outcome.txt' },
]

/** a status as the mockup marks it: a solid dot, green when live, grey otherwise, blue on the picked row */
function StatusDot({ status, on = false }: { status: Project['status']; on?: boolean }) {
  const tone = on ? 'bg-accent-text' : status === 'Live' ? 'bg-[#2ec27e]' : 'bg-fg/40'
  return <span aria-hidden className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full ${tone}`} />
}

export default function Projects() {
  const lang = useLang()
  const t = ui[lang].projects
  const projects = useContent().projects
  const reduce = useReducedMotion()
  const [index, setIndex] = useState(0)
  const [tab, setTab] = useState<Tab>('overview')
  // the window's live view: off until asked for, and off again on every switch,
  // so at most one whole website ever runs inside the page
  const [live, setLive] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const benchRef = useRef<HTMLDivElement>(null)
  useEffect(() => watchTint(sectionRef.current, 'projects'), [])

  /** picked from the list below the bench: bring the bench back up to see what was picked */
  const bringBench = () => {
    const section = sectionRef.current
    const bench = benchRef.current
    if (!section || !bench) return
    const top = bench.getBoundingClientRect().top
    // already on screen with room above it (the phone's page dots sit right under the window)
    if (top >= 64 && top < window.innerHeight * 0.45) return
    const lenis = getLenis()
    if (lenis) lenis.scrollTo(section, { immediate: !!reduce })
    else section.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
  }

  const p = projects[index]
  const { name, line } = split(p.title)
  const tabs = TABS.filter((x) => x.id !== 'build' || p.buildLog)
  // the lead is the description's first sentence; the overview tab picks up after it
  const first = lead(p.description)
  const overview = (first && p.description.slice(first.length).trim()) || p.description
  // the recordings play as one reel: when one ends, the bench moves on to the
  // next project that has a recording (wrapping round), and that one plays
  const nextReel = () => {
    for (let k = 1; k <= projects.length; k++) {
      const j = (index + k) % projects.length
      if (projects[j].video) return pick(j)
    }
  }
  const pick = (i: number, fromList = false) => {
    if (fromList) bringBench()
    setIndex(i)
    setLive(false)
    setTab('overview') // a new project opens on its overview
  }
  // paper enters tilted one way or the other, alternating, and settles flat
  const tilt = index % 2 ? 2.2 : -2.6
  const arrive = reduce
    ? { initial: false as const, animate: { opacity: 1 } }
    : {
        initial: { opacity: 0, y: 14, rotate: tilt },
        animate: { opacity: 1, y: 0, rotate: 0 },
        exit: { opacity: 0, y: 10, transition: { duration: 0.16 } },
        transition: { duration: 0.55, ease: EASE },
      }
  const rise = (d = 0) =>
    reduce
      ? { initial: false as const }
      : { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { delay: d, duration: 0.5, ease: EASE } }

  // the spec rows: only the fields this project has
  const specRows: [string, string][] = (
    [
      [t.type, p.category],
      [t.role, p.role],
      [t.builtWith, p.tags.slice(0, 3).join(' / ')],
      [t.status, t.statuses[p.status]],
      [t.year, p.period],
    ] as [string, string | undefined][]
  ).filter((r): r is [string, string] => Boolean(r[1]))

  return (
    <section ref={sectionRef} id="projects" className="relative isolate scroll-mt-0 overflow-x-clip px-[clamp(20px,4vw,64px)] py-16 sm:py-24">
      <div className="mx-auto w-full max-w-[92.5rem]">
        {/* ── header, top-left, with room around it ──────────────────── */}
        <SectionHeading index="05" label="Projects" command={t.command} subtitle={t.subtitle}>
          {/* the note in the upper middle, its arrow curling down at the featured project */}
          <InkNote arrow="down-left" arrowWidth="w-16" arrowClassName="-bottom-14 -left-14" delay={0.3} className="absolute left-[46%] top-2 hidden lg:block">
            {t.noteHeader}
          </InkNote>
        </SectionHeading>

        {/* ── the featured project: preview 55 / paper 45, the paper tucked under the window's edge ── */}
        <div ref={benchRef} className="relative grid gap-10 lg:grid-cols-[minmax(0,55fr)_minmax(0,45fr)] lg:gap-0 lg:pb-40">
          {/* left: the preview, on top */}
          <div className="relative z-10 min-w-0">
            <AnimatePresence mode="wait" initial={false}>
              <motion.figure key={p.title} {...arrive} className="m-0 overflow-hidden rounded-[4px] border border-[#111] bg-white shadow-[0_14px_28px_-16px_rgba(17,17,17,0.45)]">
                <div className="flex items-center gap-2 px-3.5 py-2.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57] opacity-75" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e] opacity-75" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#28c840] opacity-75" />
                  <span className="ml-3 min-w-0 flex-1 truncate font-mono text-[0.875rem] text-fg">~/projects/{slug(name)}</span>
                  {p.demo && (
                    <>
                      <button
                        type="button"
                        onClick={() => setLive((v) => !v)}
                        aria-pressed={live}
                        className="hidden shrink-0 items-center gap-1.5 rounded-[2px] border border-fg/25 px-2 py-0.5 font-mono text-[0.8125rem] text-fg transition-colors hover:border-fg/70 md:inline-flex"
                      >
                        {live ? (
                          <>■ {t.backToShot}</>
                        ) : (
                          <>
                            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent" /> {t.goLive}
                          </>
                        )}
                      </button>
                      <a
                        href={p.demo}
                        target="_blank"
                        rel="noreferrer"
                        className="shrink-0 font-mono text-[0.8125rem] text-fg underline-offset-2 hover:underline md:hidden"
                      >
                        {t.openLive} ↗
                      </a>
                    </>
                  )}
                </div>
                <div className="border-t border-[#111]/15">
                {live && p.demo ? (
                  <LiveFrame src={p.demo} title={name} fallback={p.image} connecting={t.connecting} className="aspect-[16/10]" />
                ) : p.video ? (
                  // the project in use, recorded: muted and looping in the window; the
                  // controls are there to unmute it, scrub, or take it full screen
                  <video
                    key={p.video}
                    // React sets `muted` as a property, not an attribute, so the browser's
                    // autoplay rule still sees an unmuted video; mute and start it by hand
                    ref={(v) => {
                      if (!v) return
                      v.muted = true
                      if (!reduce) v.play().catch(() => {})
                    }}
                    src={p.video}
                    poster={p.image}
                    muted
                    playsInline
                    // it runs like a live screen: no controls, and if anything pauses
                    // it (a tap, the OS) it picks straight back up. When it ends, the
                    // next project with a recording takes the bench and plays on;
                    // with only one recording it simply starts again
                    onPause={(e) => {
                      if (!reduce && !e.currentTarget.ended) e.currentTarget.play().catch(() => {})
                    }}
                    onEnded={(e) => {
                      if (reduce) return
                      const v = e.currentTarget
                      if (projects.filter((q) => q.video).length < 2) {
                        v.currentTime = 0
                        v.play().catch(() => {})
                      } else nextReel()
                    }}
                    disablePictureInPicture
                    disableRemotePlayback
                    preload="metadata"
                    aria-label={`${name} - screen recording`}
                    className="pointer-events-none block aspect-video h-auto w-full bg-[#111] object-contain"
                  />
                ) : p.image ? (
                  <AsciiImage
                    src={p.image}
                    alt={`${name} screenshot`}
                    reveal="wipe"
                    holdMs={380}
                    durationMs={700}
                    className="aspect-[16/10] w-full bg-[rgb(var(--bg))]"
                  />
                ) : (
                  <div className="flex aspect-[16/10] w-full flex-col items-center justify-center gap-2 rounded-[3px] bg-[rgb(var(--bg))]">
                    <span className="font-mono text-[0.8125rem] uppercase tracking-[0.25em] text-fg-dim">{p.tags.slice(0, 3).join(' / ')}</span>
                    <span className="font-mono text-[0.75rem] text-fg-dim">{t.noImage}</span>
                  </div>
                )}
                </div>
                {/* the render log, run in step with the ASCII developing into the
                    screenshot: [3/3] lands as the image finishes */}
                {!live && (
                  <ol aria-hidden className="m-0 list-none border-t border-[#111]/15 px-3.5 py-2.5 font-mono text-[0.75rem] leading-[1.6] text-fg-muted">
                    {t.render.map((line, i) => (
                      <motion.li
                        key={`${p.title}-${i}`}
                        initial={reduce ? false : { opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: reduce ? 0 : [0.05, 0.2, 0.45, 1.1][i], duration: 0.2 }}
                        className={i === 0 ? 'text-fg' : i === t.render.length - 1 ? 'text-accent-text' : undefined}
                      >
                        {i === 0 ? `$ ${line} --project ${slug(name)}` : line}
                      </motion.li>
                    ))}
                  </ol>
                )}
              </motion.figure>
            </AnimatePresence>
            {/* near the preview's lower left, its arrow pointing up into the ASCII half */}
            <InkNote arrow="up-right" arrowWidth="w-16" arrowClassName="-top-[3.75rem] left-32" delay={0.9} className="absolute left-2 top-full mt-12 hidden lg:block">
              {t.noteAscii}
            </InkNote>
          </div>

          {/* right: the project paper, starting just under the window's edge; the BUILD SPEC
              above its top-right, the duck on the desk at its lower right */}
          <div className="relative min-w-0 lg:-ml-6 lg:pt-10">
            <div className="lg:w-[84%]">
              <AnimatePresence mode="wait" initial={false}>
              <motion.article
                key={p.title}
                {...arrive}
                className="relative rounded-[2px] border border-[#111]/60 bg-white p-6 shadow-[6px_6px_0_#111] sm:p-8 lg:p-10"
              >
                <motion.p {...rise(0.05)} className="break-words font-mono text-2xl font-bold uppercase tracking-wide text-fg sm:text-[1.875rem] lg:pr-[9rem]">
                  {pad(index + 1)} / {name}
                </motion.p>
                {line && (
                  <motion.p {...rise(0.1)} className="mt-3 font-mono text-base font-bold leading-snug text-fg">
                    {line}
                  </motion.p>
                )}
                {first && (
                  <motion.p {...rise(0.14)} className="mt-1 max-w-[60ch] font-mono text-[0.875rem] leading-relaxed text-fg">
                    {first}
                  </motion.p>
                )}

                {/* the documents: small terminal controls, not buttons */}
                <div role="tablist" className="mt-5 flex flex-wrap gap-2">
                  {tabs.map((x) => (
                    <button
                      key={x.id}
                      role="tab"
                      aria-selected={tab === x.id}
                      onClick={() => setTab(x.id)}
                      className={`rounded-[3px] border-[1.5px] px-3 py-1.5 font-mono text-[0.8125rem] transition-colors ${
                        tab === x.id
                          ? 'border-accent-text bg-white/70 text-accent-text'
                          : 'border-transparent bg-fg/[0.06] text-fg hover:bg-fg/[0.1]'
                      }`}
                    >
                      $ cat {x.file}
                    </button>
                  ))}
                </div>
                <div role="tabpanel" className="mt-4 min-h-[6.5rem]">
                  {tab === 'overview' && (
                    <p className="max-w-[60ch] font-sans text-[0.9375rem] leading-relaxed text-fg th:leading-[1.8]">{overview}</p>
                  )}
                  {tab === 'build' && p.buildLog && (
                    <pre className="m-0 whitespace-pre-wrap font-mono text-[0.8125rem] leading-relaxed text-fg">{p.buildLog}</pre>
                  )}
                  {tab === 'outcome' && (
                    <dl className="m-0 grid gap-2 font-mono text-[0.8125rem] leading-relaxed">
                      <div className="flex items-center gap-3">
                        <dt className="w-20 shrink-0 text-[0.8125rem] uppercase tracking-[0.2em] text-fg-dim">{t.status}</dt>
                        <dd className="m-0 flex items-center gap-2 text-fg">
                          <StatusDot status={p.status} /> {t.statuses[p.status]}
                        </dd>
                      </div>
                      {p.contribution && (
                        <div className="flex gap-3">
                          <dt className="w-20 shrink-0 pt-0.5 text-[0.8125rem] uppercase tracking-[0.2em] text-fg-dim">{t.credit}</dt>
                          <dd className="m-0 text-fg">{p.contribution}</dd>
                        </div>
                      )}
                    </dl>
                  )}
                </div>

                {/* metadata: plain and technical */}
                <dl className="mt-5 grid gap-3 font-mono text-[0.8125rem]">
                  <div>
                    <dt className="text-[0.8125rem] font-bold uppercase tracking-[0.05em] text-fg">{t.role}</dt>
                    <dd className="m-0 text-[0.875rem] text-fg">{p.role}</dd>
                  </div>
                  <div>
                    <dt className="text-[0.8125rem] font-bold uppercase tracking-[0.05em] text-fg">{t.builtWith}</dt>
                    <dd className="m-0 text-[0.875rem] text-fg">{p.tags.join(' · ')}</dd>
                  </div>
                </dl>

                <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
                  <Link
                    href={`/projects/${projectSlug(p)}`}
                    data-cursor-label="case study"
                    className="inline-flex w-[65%] min-w-[14rem] items-center gap-4 rounded-[3px] border border-[#111] bg-[#111] px-5 py-3 font-mono text-[0.875rem] uppercase tracking-[0.12em] text-[rgb(var(--bg))] transition-[background-color,color,transform] duration-200 hover:translate-y-0.5 hover:bg-white hover:text-[#111] th:tracking-normal"
                  >
                    <span aria-hidden className="text-lg leading-none">→</span> {t.viewCase}
                  </Link>
                  {p.demo && (
                    <a
                      href={p.demo}
                      target="_blank"
                      rel="noreferrer"
                      data-cursor-label={`${t.viewLive} ↗`}
                      className="font-mono text-[0.75rem] uppercase tracking-[0.2em] text-fg underline-offset-4 hover:underline th:tracking-normal"
                    >
                      {t.viewLive} ↗
                    </a>
                  )}
                  {p.repo && (
                    <a
                      href={p.repo}
                      target="_blank"
                      rel="noreferrer"
                      data-cursor-label={`${t.source} ↗`}
                      className="font-mono text-[0.75rem] uppercase tracking-[0.2em] text-fg-muted underline-offset-4 hover:text-fg hover:underline th:tracking-normal"
                    >
                      {t.source} ↗
                    </a>
                  )}
                </div>
              </motion.article>
              </AnimatePresence>
            </div>

            {/* BUILD SPEC: a small tilted print taped above the paper's top-right corner */}
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={p.title}
                initial={reduce ? false : { opacity: 0, y: -10, rotate: 5 }}
                animate={{ opacity: 1, y: 0, rotate: 2.5 }}
                exit={reduce ? undefined : { opacity: 0, transition: { duration: 0.12 } }}
                transition={{ delay: reduce ? 0 : 0.18, duration: 0.5, ease: EASE }}
                className="relative mx-auto mt-10 w-[min(15rem,90%)] lg:absolute lg:-top-40 lg:right-0 lg:mx-0 lg:mt-0 lg:w-[15rem]"
              >
              {/* a strip of tape across the top */}
                <span aria-hidden className="absolute -top-2.5 left-1/2 z-10 h-5 w-16 -translate-x-1/2 -rotate-3 bg-[#d9cdb2]/85" />
                <div className="rounded-[2px] border border-[#111]/60 bg-white px-5 py-4 font-mono text-[0.75rem] uppercase text-[#111] shadow-[6px_6px_0_#111]">
                  <p className="border-b border-dashed border-[#111]/50 pb-2 text-base font-bold tracking-[0.05em]">{t.spec}</p>
                  <dl className="m-0 grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1.5 py-3">
                    {specRows.map(([k, v]) => (
                      <div key={k} className="contents">
                        <dt className="tracking-[0.05em] text-[#111]">{k}</dt>
                        <dd className="m-0 break-words">{v}</dd>
                      </div>
                    ))}
                  </dl>
                  <div className="flex items-end justify-between border-t border-dashed border-[#111]/40 pt-2">
                    <span className="text-[0.8125rem] font-bold tracking-[0.05em]">ZARUTECH</span>
                    <Barcode className="h-8 w-auto" />
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* the hacker duck on the desk at the lower right, one line of commentary */}
            <div className="pointer-events-none relative mx-auto mt-10 h-64 w-80 max-w-full lg:absolute lg:-bottom-36 lg:-right-10 lg:mx-0 lg:mt-0">
              <span className="absolute right-0 top-0 text-fg">
                <InkBubble className="font-hand text-[0.9375rem]">
                  <span className="whitespace-pre-line leading-tight">{t.duck}</span>
                </InkBubble>
              </span>
              {/* a star in the section's ink, a sparkle in the duck's orange */}
              <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinejoin="round" className="absolute left-8 top-16 h-7 w-7 text-accent-text">
                <path d="M12 2.8 14.6 9l6.6.5-5 4.3 1.6 6.5L12 16.8l-5.8 3.5 1.6-6.5-5-4.3L9.4 9Z" vectorEffect="non-scaling-stroke" />
              </svg>
              <svg aria-hidden viewBox="0 0 24 24" className="absolute right-6 top-28 h-6 w-6 text-duck">
                <path d="M12 1.5C12.9 8.4 15.6 11.1 22.5 12 15.6 12.9 12.9 15.6 12 22.5 11.1 15.6 8.4 12.9 1.5 12 8.4 11.1 11.1 8.4 12 1.5Z" fill="currentColor" />
              </svg>
              {/* the hacker duck in its ink print, the same plate the spec label in System Profile uses */}
              <div className="absolute bottom-1 left-12 [filter:drop-shadow(0_10px_8px_rgb(var(--fg)/0.25))]">
                <Image src="/duck/hacker-print.png" alt="" width={480} height={454} sizes="12rem" className="block h-auto w-48" />
              </div>
              {/* the floor */}
              <svg aria-hidden viewBox="0 0 288 12" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" className="absolute inset-x-0 bottom-0 h-3 w-full text-fg">
                <path d="M4 8C60 6.5 120 7.4 180 6.2C220 5.4 255 6 284 5" vectorEffect="non-scaling-stroke" />
              </svg>
            </div>
          </div>
        </div>

        {/* phone: where in the folder you are */}
        <div className="mt-6 flex flex-wrap justify-center gap-1.5 lg:hidden" role="tablist" aria-label={t.pick}>
          {projects.map((q, i) => (
            <button
              key={q.title}
              role="tab"
              aria-selected={i === index}
              aria-label={split(q.title).name}
              onClick={() => pick(i)}
              className={`h-2 rounded-full transition-all ${i === index ? 'w-5 bg-accent-text' : 'w-2 bg-fg/25'}`}
            />
          ))}
        </div>

        {/* ── the full story: every project, open, on one line ───────── */}
        <ProjectTimeline projects={projects} selected={index} onPick={(i) => pick(i, true)} t={t} />
      </div>

    </section>
  )
}

/**
 * The project's real site, running inside the window. It is laid out at a
 * desktop width and scaled down to the window, so it reads as the site rather
 * than its phone layout; the screenshot stays underneath until the site has
 * painted. Sandboxed: scripts and forms run, the top page cannot be touched.
 */
const LIVE_W = 1440
function LiveFrame({ src, title, fallback, connecting, className = '' }: { src: string; title: string; fallback?: string; connecting: string; className?: string }) {
  const box = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0)
  const [boxH, setBoxH] = useState(0)
  const [loaded, setLoaded] = useState(false)
  useEffect(() => {
    const el = box.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(([e]) => {
      setScale(e.contentRect.width / LIVE_W)
      setBoxH(e.contentRect.height)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const host = new URL(src).host
  return (
    <div ref={box} data-lenis-prevent className={`relative w-full overflow-hidden rounded-[3px] bg-[rgb(var(--bg))] ${className}`}>
      {fallback && !loaded && (
        <Image src={fallback} alt="" fill sizes="(min-width: 768px) 55vw, 100vw" className="object-cover object-top opacity-40" />
      )}
      {!loaded && (
        <span className="absolute inset-x-0 bottom-3 text-center font-mono text-[0.8125rem] text-fg-muted">
          {connecting.replace('{host}', host)}
        </span>
      )}
      {scale > 0 && (
        <iframe
          src={src}
          title={`${title} - live`}
          onLoad={() => setLoaded(true)}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          referrerPolicy="strict-origin-when-cross-origin"
          className="absolute left-0 top-0 origin-top-left border-0 bg-white"
          style={{ width: LIVE_W, height: boxH && scale ? boxH / scale : (LIVE_W * 9) / 16, transform: `scale(${scale})`, opacity: loaded ? 1 : 0, transition: 'opacity 300ms' }}
        />
      )}
    </div>
  )
}

