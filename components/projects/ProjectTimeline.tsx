'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, useReducedMotion, useScroll, useSpring } from 'motion/react'
import type { Project } from '@/data/portfolio'
import { ui } from '@/data/ui'
import { lead, projectSlug, splitTitle } from '@/lib/projects'

/**
 * Every project, all of them open at once, on one line that draws itself as
 * the page scrolls past: the full story from the first build to the newest.
 *
 * The data only knows years (2025, 2025-2026, 2026), so the story is told in
 * year chapters, oldest first. Inside a chapter the projects keep the order
 * of data/portfolio.ts - the timeline does not invent a month it was not given.
 *
 * Each stop is a printed screenshot (or the project's recording, playing
 * while it is on screen) with its name, its one line, what kind of
 * thing it is and its status, the first sentence of what it is, and the ways
 * in: the case study, the workbench above, the live site. Desktop alternates
 * the stops either side of the line; a phone runs them down one side.
 *
 * The line is ink with the section's blue drawn over it by scroll progress.
 * Reduced motion gets the whole line drawn and every stop in place.
 */
const EASE = [0.16, 1, 0.3, 1] as const

const startYear = (period: string) => parseInt(period, 10) || 0
const endYear = (period: string) => parseInt(period.split('-').pop() ?? '', 10) || startYear(period)
const chapterLabel = (period: string) => period.replace('-', ' – ')

export default function ProjectTimeline({
  projects,
  selected,
  onPick,
  t,
}: {
  projects: Project[]
  selected: number
  onPick: (i: number) => void
  t: (typeof ui)['en']['projects']
}) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 75%', 'end 60%'] })
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.4 })

  // chapters by period, oldest first; each keeps its projects' data order
  const periods = [...new Set(projects.map((p) => p.period))].sort((a, b) => startYear(a) - startYear(b) || endYear(a) - endYear(b))
  const chapters = periods.map((period) => ({
    period,
    items: projects.map((p, i) => ({ p, i })).filter(({ p }) => p.period === period),
  }))
  let side = 0 // alternates across chapters, so the zig-zag never restarts

  return (
    <section aria-labelledby="project-story" className="mt-24 md:mt-28">
      <header className="mb-12">
        <h3 id="project-story" className="font-mono text-[1.375rem] font-bold text-fg sm:text-[1.75rem]">
          <span className="text-accent-text">$</span> {t.storyCommand}
        </h3>
        <p className="mt-2 font-mono text-[0.9375rem] text-fg-muted th:font-sans">{t.storySub}</p>
      </header>

      <div ref={ref} className="relative">
        {/* the line: ink, with the blue drawn down it as you read */}
        <span aria-hidden className="absolute bottom-0 left-[0.6875rem] top-0 w-px bg-fg/20 lg:left-1/2" />
        <motion.span
          aria-hidden
          style={{ scaleY: reduce ? 1 : progress }}
          className="absolute bottom-0 left-[0.625rem] top-0 w-[3px] origin-top bg-accent-text lg:left-[calc(50%-1px)]"
        />

        {chapters.map((ch) => (
          <div key={ch.period} className="relative pb-6">
            {/* the chapter's year, sitting on the line */}
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.8 }}
              transition={{ duration: 0.6, ease: EASE }}
              className="relative z-10 mb-10 flex items-center gap-3 lg:justify-center"
            >
              {/* the year sits centred on the line; its count hangs off to the side */}
              <span className="relative rounded-[3px] border border-[#111] bg-accent px-2.5 py-0.5 font-crt text-[1.75rem] leading-none text-[#111] shadow-[3px_3px_0_#111]">
                {chapterLabel(ch.period)}
                <span className="absolute left-full top-1/2 ml-4 -translate-y-1/2 whitespace-nowrap font-mono text-[0.75rem] uppercase tracking-[0.2em] text-fg-dim th:tracking-normal">
                  {ch.items.length} {t.storyCount}
                </span>
              </span>
            </motion.div>

            <ol className="m-0 grid list-none gap-14 p-0 lg:grid-cols-2 lg:gap-x-28 lg:gap-y-10">
              {ch.items.map(({ p, i }) => {
                const right = side++ % 2 === 1
                return (
                  <Stop
                    key={p.title}
                    p={p}
                    i={i}
                    right={right}
                    on={i === selected}
                    onPick={onPick}
                    t={t}
                    reduce={!!reduce}
                  />
                )
              })}
            </ol>
          </div>
        ))}
      </div>
    </section>
  )
}

function Stop({
  p,
  i,
  right,
  on,
  onPick,
  t,
  reduce,
}: {
  p: Project
  i: number
  right: boolean
  on: boolean
  onPick: (i: number) => void
  t: (typeof ui)['en']['projects']
  reduce: boolean
}) {
  const { name, line } = splitTitle(p.title)
  const first = lead(p.description) || p.description
  return (
    <motion.li
      initial={reduce ? false : { opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.6, ease: EASE }}
      // a phone runs every stop down the right of the line; desktop places
      // them either side, the right-hand ones a step lower so the two
      // columns read as one zig-zag rather than two lists
      className={`relative pl-10 lg:pl-0 ${right ? 'lg:col-start-2 lg:mt-24' : 'lg:col-start-1'}`}
    >
      {/* the stop's dot on the line, with a short tick out to the print */}
      <span
        aria-hidden
        className={`absolute top-10 z-10 h-[1.125rem] w-[1.125rem] rounded-full border-2 border-[#111] ${on ? 'bg-accent' : 'bg-white'} left-[0.125rem] lg:left-auto ${right ? 'lg:-left-[4.0625rem]' : 'lg:-right-[4.0625rem]'}`}
      />
      <span aria-hidden className={`absolute top-[2.875rem] hidden h-px w-14 bg-fg/30 lg:block ${right ? '-left-14' : '-right-14'}`} />

      <article
        className={`rounded-[3px] border bg-white p-3 shadow-[6px_6px_0_#111] transition-colors sm:p-4 ${on ? 'border-accent-text' : 'border-[#111]/45'} ${right ? 'lg:rotate-[0.6deg]' : 'lg:-rotate-[0.6deg]'} motion-reduce:!rotate-0`}
      >
        {/* the print */}
        <div className="relative overflow-hidden border border-[#111]/15 bg-[rgb(var(--bg))]">
          {p.video ? (
            <Reel src={p.video} poster={p.image} label={`${name} - screen recording`} reduce={reduce} />
          ) : p.image ? (
            <Image src={p.image} alt={`${name} screenshot`} width={800} height={500} sizes="(min-width: 1024px) 40vw, 90vw" className="aspect-[16/10] w-full object-cover object-top" />
          ) : (
            <div className="flex aspect-[16/10] w-full flex-col items-center justify-center gap-1.5 px-4 text-center">
              <span className="font-mono text-[0.8125rem] uppercase tracking-[0.2em] text-fg-dim th:tracking-normal">{p.tags.slice(0, 3).join(' / ')}</span>
              <span className="font-mono text-[0.75rem] text-fg-dim">{t.noImage}</span>
            </div>
          )}
          {p.video && (
            <span className="absolute bottom-2 left-2 rounded-[2px] bg-[#111] px-1.5 py-0.5 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-white">
              ▶ {t.storyVideo}
            </span>
          )}
        </div>

        {/* the record */}
        <div className="px-1 pb-1 pt-4">
          <p className="font-mono text-[0.75rem] uppercase tracking-[0.14em] text-fg-dim th:tracking-normal">
            {String(i + 1).padStart(2, '0')} · {p.category ?? ''} · {t.statuses[p.status]}
          </p>
          <h4 className={`mt-1.5 font-mono text-[1.25rem] font-bold leading-tight ${on ? 'text-accent-text' : 'text-fg'}`}>{name}</h4>
          {line && <p className="mt-1 font-sans text-[0.9375rem] font-semibold text-fg">{line}</p>}
          <p className="mt-2 font-sans text-[0.9375rem] leading-relaxed text-fg/85 th:leading-[1.8]">{first}</p>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[0.75rem] uppercase tracking-[0.14em] th:tracking-normal">
            <Link href={`/projects/${projectSlug(p)}`} className="rounded-[3px] bg-[#111] px-3 py-1.5 text-[rgb(var(--bg))] transition-opacity hover:opacity-85">
              → {t.viewCase}
            </Link>
            <button type="button" onClick={() => onPick(i)} aria-pressed={on} className={`underline-offset-4 hover:underline ${on ? 'text-accent-text' : 'text-fg'}`}>
              {on ? t.storyOnBench : t.storyToBench}
            </button>
            {p.demo && (
              <a href={p.demo} target="_blank" rel="noreferrer" className="text-fg-muted underline-offset-4 hover:text-fg hover:underline">
                {t.viewLive} ↗
              </a>
            )}
          </div>
        </div>
      </article>
    </motion.li>
  )
}

/**
 * A project's recording on its print: muted, looping, playing only while it
 * is on screen (so twelve stops never decode three videos at once off-page),
 * nothing fetched until it is near. Reduced motion shows the still instead.
 */
function Reel({ src, poster, label, reduce }: { src: string; poster?: string; label: string; reduce: boolean }) {
  const ref = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const v = ref.current
    if (!v || reduce || typeof IntersectionObserver === 'undefined') return
    v.muted = true // the attribute React does not set; autoplay needs it
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          if (v.preload !== 'auto') v.preload = 'auto'
          v.play().catch(() => {})
        } else v.pause()
      },
      { threshold: 0.35 },
    )
    io.observe(v)
    return () => io.disconnect()
  }, [reduce])
  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      disablePictureInPicture
      disableRemotePlayback
      aria-label={label}
      className="pointer-events-none block aspect-video w-full bg-[#111] object-contain"
    />
  )
}
