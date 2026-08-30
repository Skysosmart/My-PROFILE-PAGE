'use client'

import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import GlassSection from '@/components/ui/GlassSection'
import ProjectWall from '@/components/effects/ProjectWall'
import { projects, type Project } from '@/data/portfolio'

/**
 * PROJECTS - every project on screen at once, each one a browser window.
 *
 * The character comes from the frame, not from an interaction: each card wears
 * the same window chrome as the About Me terminal, with the project's real URL
 * in its address bar and a screenshot of the running site in its viewport. You
 * read the whole section by looking at it. Clicking the address bar opens the
 * site; that is the only thing to learn.
 *
 * This replaced a master-detail explorer that put one project on screen and the
 * other eight behind a click. It was a nicer machine and a worse page.
 */

const statusStyle: Record<string, string> = {
  // Live reads brightest: a product anyone can open right now outranks one
  // that is merely finished
  Live: 'border-emerald-300/70 text-emerald-200',
  Completed: 'border-white/40 text-white/80',
  'In Progress': 'border-white/25 text-white/60',
  Upcoming: 'border-white/15 text-white/45',
}

const host = (url: string) => url.replace(/^https?:\/\//, '').replace(/\/$/, '')

export default function Projects() {
  const reduce = useReducedMotion()
  const [still, setStill] = useState(false)
  useEffect(() => setStill(!!reduce), [reduce])

  // counted off the list, so the rail can never drift from the cards
  const live = projects.filter((p) => p.status === 'Live').length
  const openable = projects.filter((p) => p.demo).length
  const sourced = projects.filter((p) => p.repo).length

  return (
    <GlassSection
      id="projects"
      index="03"
      title="Projects"
      variant="slide"
      background={<ProjectWall />}
      panel={false}
      revealAmount="some"
    >
      <div className="mb-5 flex flex-wrap items-center gap-x-5 gap-y-1 border-y border-white/12 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-white/40">
        <span>{projects.length} projects</span>
        <span className="text-white/70">{live} live</span>
        <span>{openable} you can open</span>
        <span>{sourced} open source</span>
      </div>

      <div className="grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {projects.map((p, i) => (
          <Card key={p.title} p={p} index={i} still={still} />
        ))}
      </div>
    </GlassSection>
  )
}

function Card({ p, index, still }: { p: Project; index: number; still: boolean }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.06, 0.4), ease: [0.16, 1, 0.3, 1] }}
      whileHover={still ? undefined : { y: -4 }}
      className="group flex flex-col overflow-hidden rounded-xl border border-white/12 bg-black/45 transition-colors hover:border-white/30"
    >
      {/* title bar: traffic lights and the address bar, same chrome as the
          About Me terminal - and the address really is the address */}
      <div className="flex shrink-0 items-center gap-2 border-b border-white/10 bg-white/[0.03] px-3 py-2">
        <span className="h-2 w-2 shrink-0 rounded-full border border-white/25" />
        <span className="h-2 w-2 shrink-0 rounded-full border border-white/25" />
        <span className="h-2 w-2 shrink-0 rounded-full bg-white/50" />
        {p.demo ? (
          <a
            href={p.demo}
            target="_blank"
            rel="noreferrer"
            className="ml-1 flex min-w-0 flex-1 items-center gap-1.5 rounded-full border border-white/10 bg-black/50 px-2.5 py-0.5 font-mono text-[10px] text-white/55 transition-colors hover:border-white/40 hover:text-white"
          >
            <span aria-hidden className="shrink-0 text-white/30">
              &#9737;
            </span>
            <span className="truncate">{host(p.demo)}</span>
            <span aria-hidden className="ml-auto shrink-0 text-white/25 group-hover:text-white/60">
              &#8599;
            </span>
          </a>
        ) : (
          <span className="ml-1 flex min-w-0 flex-1 items-center gap-1.5 rounded-full border border-white/[0.07] bg-black/50 px-2.5 py-0.5 font-mono text-[10px] text-white/25">
            <span aria-hidden className="shrink-0">
              &#9711;
            </span>
            <span className="truncate">no public site</span>
          </span>
        )}
      </div>

      {/* the viewport */}
      <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden border-b border-white/10 bg-black">
        {p.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={p.image}
            alt={`${p.title} screenshot`}
            loading="lazy"
            className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div
            className="flex h-full w-full flex-col items-center justify-center gap-2 px-4 text-center"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.10) 1px, transparent 1px)',
              backgroundSize: '14px 14px',
            }}
          >
            <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-white/45">
              {p.tags.slice(0, 3).join(' / ')}
            </span>
            <span className="font-mono text-[10px] text-white/25">nothing to render</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
          <h3 className="font-sans text-[16px] font-semibold leading-snug text-white">{p.title}</h3>
          <span
            className={`shrink-0 rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider ${
              statusStyle[p.status] ?? statusStyle.Upcoming
            }`}
          >
            {p.status}
          </span>
        </div>
        <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-white/40">
          {p.role} · {p.period}
        </p>

        {/* sans, not mono: these are paragraphs, and the meta around them
            already carries the terminal voice */}
        <p className="mt-3 font-sans text-[13px] leading-relaxed text-white/70">{p.description}</p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {p.tags.map((t) => (
            <span
              key={t}
              className="rounded border border-white/12 px-1.5 py-0.5 font-mono text-[10px] text-white/50"
            >
              {t}
            </span>
          ))}
        </div>

        {/* counted off GitHub, not asserted - it sits with the source link
            because it is the same kind of claim: checkable */}
        {p.contribution && (
          <p className="mt-3 font-mono text-[10px] leading-relaxed text-white/35">
            {p.contribution}
          </p>
        )}

        {p.repo && (
          <div className="mt-auto flex flex-wrap items-center gap-x-4 border-t border-white/10 pt-3 [&:not(:first-child)]:mt-4">
            <a
              href={p.repo}
              target="_blank"
              rel="noreferrer"
              className="group/l font-mono text-[10px] uppercase tracking-wider text-white/55 transition-colors hover:text-white"
            >
              <span aria-hidden>&#8599;</span>{' '}
              <span className="underline-offset-2 group-hover/l:underline">Source</span>
            </a>
          </div>
        )}
      </div>
    </motion.article>
  )
}
