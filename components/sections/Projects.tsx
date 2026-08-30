'use client'

import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import GlassSection from '@/components/ui/GlassSection'
import ProjectWall from '@/components/effects/ProjectWall'
import { projects, type Project } from '@/data/portfolio'

/**
 * PROJECTS - a grid, with a shot of the thing itself on every card.
 *
 * It used to be a carousel: eleven cards, two and a half of them on screen, and
 * you had to drag five times to reach the end. Nothing here is behind an
 * interaction now; the whole list is on the page.
 *
 * Every project with a live site carries a real screenshot of it, captured from
 * the running site rather than mocked up. The three without one - a robot, a
 * data pipeline - say so instead of faking a frame.
 */

const statusStyle: Record<string, string> = {
  // Live reads brightest: a product anyone can open right now outranks one
  // that is merely finished
  Live: 'border-emerald-300/70 bg-emerald-950/60 text-emerald-200',
  Completed: 'border-white/40 bg-black/60 text-white',
  'In Progress': 'border-white/25 bg-black/60 text-white/70',
  Upcoming: 'border-white/15 bg-black/60 text-white/50',
}

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
      // its own band of the page, like About and Certificates - not a card
      // floating on top of one
      panel={false}
      revealAmount="some"
    >
      {/* the same stat rail Certificates opens with, so the two read as siblings */}
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
      className="group flex flex-col overflow-hidden rounded-2xl border border-white/12 bg-white/[0.02] transition-colors hover:border-white/30"
    >
      {/* the thing itself */}
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
          // no live site to shoot: say so rather than fake a browser frame
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
            <span className="font-mono text-[10px] text-white/25">no public site</span>
          </div>
        )}
        <span
          className={`absolute right-3 top-3 rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider backdrop-blur-sm ${
            statusStyle[p.status] ?? statusStyle.Upcoming
          }`}
        >
          {p.status}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-sans text-[17px] font-semibold leading-snug text-white">{p.title}</h3>
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

        {/* counted off GitHub, not asserted - it sits with the links because it
            is the same kind of claim: checkable */}
        {p.contribution && (
          <p className="mt-3 font-mono text-[10px] leading-relaxed text-white/35">
            {p.contribution}
          </p>
        )}

        {(p.demo || p.repo) && (
          <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-white/10 pt-3 [&:not(:first-child)]:mt-4">
            {p.demo && (
              <a
                href={p.demo}
                target="_blank"
                rel="noreferrer"
                className="group/l font-mono text-[10px] uppercase tracking-wider text-white/60 transition-colors hover:text-white"
              >
                <span aria-hidden>↗</span>{' '}
                <span className="underline-offset-2 group-hover/l:underline">Live demo</span>
              </a>
            )}
            {p.repo && (
              <a
                href={p.repo}
                target="_blank"
                rel="noreferrer"
                className="group/l font-mono text-[10px] uppercase tracking-wider text-white/60 transition-colors hover:text-white"
              >
                <span aria-hidden>↗</span>{' '}
                <span className="underline-offset-2 group-hover/l:underline">Source</span>
              </a>
            )}
          </div>
        )}
      </div>
    </motion.article>
  )
}
