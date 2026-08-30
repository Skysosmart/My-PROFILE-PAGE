'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import GlassSection from '@/components/ui/GlassSection'
import ProjectWall from '@/components/effects/ProjectWall'
import { projects, type Project } from '@/data/portfolio'

/**
 * PROJECTS - a file explorer, and a browser to open things in.
 *
 * About Me is a machine you can actually use: a terminal that takes commands,
 * a portrait beside it, both wearing the same window chrome. This is the
 * counterpart. `ls ~/projects` lists every directory on the left - all nine
 * visible at once, nothing hidden - and whichever one is selected opens on the
 * right inside a real browser window, with its live URL in the address bar and
 * a screenshot of the running site in the viewport.
 *
 * The address bar is the joke that has to land: it shows the URL the project
 * actually answers on, and clicking it goes there. The two projects with
 * nothing to open say `no public site` in the same slot rather than pretending.
 *
 * Three windows, not two: the write-up sits in its own README pane rather than
 * under the screenshot. Stacked, the browser viewport came out four times wider
 * than it was tall and object-cover shaved a 1.6:1 screenshot down to its top
 * nav strip. Beside it, the viewport lands near the screenshot's own aspect and
 * you see the whole page.
 *
 * Arrow keys walk the list; the selection is a real roving focus, so tab lands
 * in the list once rather than nine times.
 */

const statusDot: Record<string, string> = {
  Live: 'bg-emerald-400',
  Completed: 'bg-white/70',
  'In Progress': 'bg-white/40',
  Upcoming: 'bg-white/20',
}

const host = (url?: string) => (url ? url.replace(/^https?:\/\//, '').replace(/\/$/, '') : null)

/** The window chrome both panes wear, same as the About Me terminal. */
function TitleBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex shrink-0 items-center gap-2 border-b border-white/10 bg-white/[0.03] px-4 py-2.5">
      <span className="h-2.5 w-2.5 shrink-0 rounded-full border border-white/25" />
      <span className="h-2.5 w-2.5 shrink-0 rounded-full border border-white/25" />
      <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-white/60" />
      {children}
    </div>
  )
}

export default function Projects() {
  const [sel, setSel] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)
  const p: Project = projects[sel]

  const live = projects.filter((x) => x.status === 'Live').length

  // roving focus: the list is one tab stop, arrows move inside it
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
    e.preventDefault()
    const next = (sel + (e.key === 'ArrowDown' ? 1 : -1) + projects.length) % projects.length
    setSel(next)
    listRef.current?.querySelector<HTMLElement>(`[data-i="${next}"]`)?.focus()
  }

  return (
    <GlassSection
      id="projects"
      index="03"
      title="Projects"
      variant="slide"
      background={<ProjectWall />}
      fullScreen
      panel={false}
    >
      <div className="flex flex-1 flex-col gap-4 lg:flex-row">
        {/* ---------- the directory ------------------------------------------ */}
        <div className="flex shrink-0 flex-col overflow-hidden rounded-xl border border-white/12 bg-black/35 lg:w-[250px]">
          <TitleBar>
            <span className="ml-2 truncate font-mono text-[11px] text-white/40">
              ~/projects - ls
            </span>
          </TitleBar>

          <div
            ref={listRef}
            role="listbox"
            aria-label="Projects"
            aria-activedescendant={`proj-${sel}`}
            onKeyDown={onKey}
            className="flex-1 overflow-y-auto p-2 lg:overflow-x-hidden"
          >
            {projects.map((x, i) => {
              const on = i === sel
              return (
                <button
                  key={x.slug}
                  id={`proj-${i}`}
                  data-i={i}
                  role="option"
                  aria-selected={on}
                  tabIndex={on ? 0 : -1}
                  onClick={() => setSel(i)}
                  className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-left font-mono text-[12px] transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-white/60 ${
                    on ? 'bg-white/10 text-white' : 'text-white/55 hover:bg-white/[0.05] hover:text-white'
                  }`}
                >
                  <span className={`w-2 shrink-0 ${on ? 'text-white' : 'text-transparent'}`}>
                    &#9656;
                  </span>
                  <span
                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${statusDot[x.status] ?? statusDot.Upcoming}`}
                  />
                  <span className="flex-1 truncate">{x.slug}/</span>
                  <span className="shrink-0 tabular-nums text-white/30">{x.period}</span>
                </button>
              )
            })}
          </div>

          <div className="shrink-0 border-t border-white/10 bg-white/[0.02] px-4 py-2.5 font-mono text-[10px] uppercase tracking-wider text-white/35">
            {projects.length} dirs · {live} live · &#8593;&#8595; to move
          </div>
        </div>

        {/* ---------- the browser -------------------------------------------- */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-white/12 bg-black/40">
          <TitleBar>
            {/* the address bar: the real URL, and it really goes there */}
            {p.demo ? (
              <a
                href={p.demo}
                target="_blank"
                rel="noreferrer"
                className="group ml-2 flex min-w-0 flex-1 items-center gap-2 rounded-full border border-white/10 bg-black/50 px-3 py-1 font-mono text-[11px] text-white/55 transition-colors hover:border-white/35 hover:text-white"
              >
                <span aria-hidden className="shrink-0 text-white/30">
                  &#9737;
                </span>
                <span className="truncate">{host(p.demo)}</span>
                <span aria-hidden className="ml-auto shrink-0 text-white/25 group-hover:text-white">
                  &#8599;
                </span>
              </a>
            ) : (
              <span className="ml-2 flex min-w-0 flex-1 items-center gap-2 rounded-full border border-white/[0.07] bg-black/50 px-3 py-1 font-mono text-[11px] text-white/25">
                <span aria-hidden className="shrink-0">
                  &#9711;
                </span>
                <span className="truncate">no public site</span>
              </span>
            )}
          </TitleBar>

          {/* viewport: fills the window on wide screens, fixed when stacked */}
          <div className="relative h-[32vh] shrink-0 overflow-hidden bg-black lg:h-auto lg:min-h-0 lg:flex-1 lg:shrink">
            {p.image ? (
              <motion.img
                key={p.slug}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.28 }}
                src={p.image}
                alt={`${p.title} screenshot`}
                className="h-full w-full object-cover object-top"
              />
            ) : (
              <div
                key={p.slug}
                className="flex h-full w-full flex-col items-center justify-center gap-2"
                style={{
                  backgroundImage:
                    'radial-gradient(circle, rgba(255,255,255,0.10) 1px, transparent 1px)',
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

        </div>

        {/* ---------- the write-up ------------------------------------------- */}
        {/* bg-black/60, not /40: the window wall behind this shows through a
            thinner fill and competes with the paragraph */}
        <div className="flex shrink-0 flex-col overflow-hidden rounded-xl border border-white/12 bg-black/60 lg:w-[330px]">
          <TitleBar>
            <span className="ml-2 truncate font-mono text-[11px] text-white/40">
              ~/projects/{p.slug} - README
            </span>
          </TitleBar>

          <motion.div
            key={p.slug}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28 }}
            className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4 sm:p-5"
          >
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h3 className="font-sans text-base font-semibold leading-snug text-white">
                {p.title}
              </h3>
              <span
                className={`shrink-0 rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${
                  p.status === 'Live'
                    ? 'border-emerald-300/70 text-emerald-200'
                    : 'border-white/35 text-white/70'
                }`}
              >
                {p.status}
              </span>
            </div>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-white/40">
              {p.role} · {p.period}
            </p>

            <p className="mt-3 font-sans text-[13px] leading-relaxed text-white/75">
              {p.description}
            </p>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {p.tags.map((t) => (
                <span
                  key={t}
                  className="rounded border border-white/12 px-1.5 py-0.5 font-mono text-[10px] text-white/50"
                >
                  {t}
                </span>
              ))}
            </div>

            {p.contribution && (
              <p className="mt-3 font-mono text-[10px] leading-relaxed text-white/35">
                {p.contribution}
              </p>
            )}

            {p.repo && (
              <div className="mt-auto flex flex-wrap items-center gap-x-4 pt-3">
                <a
                  href={p.repo}
                  target="_blank"
                  rel="noreferrer"
                  className="group font-mono text-[10px] uppercase tracking-wider text-white/55 transition-colors hover:text-white"
                >
                  <span aria-hidden>&#8599;</span>{' '}
                  <span className="underline-offset-2 group-hover:underline">Source</span>
                </a>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </GlassSection>
  )
}
