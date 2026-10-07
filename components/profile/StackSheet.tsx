'use client'

import { useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { projects, type Skill } from '@/data/portfolio'
import { techColors, techIcons } from '@/data/tech-icons'
import { fmt, ui } from '@/data/ui'
import { useContent } from '@/lib/use-content'
import { useLang } from '@/lib/use-lang'

/**
 * The stack as an engineering reference sheet: printed file-folder tabs on
 * the top edge, a dashed sheet under them, one row per skill group with the
 * group's label down the left and its marks in columns. Every skill and its
 * 1-5 level is data/portfolio.ts `skills`; the ticks under a mark are that
 * level, and nothing here is a percentage.
 *
 * "All" lays the groups out as the sheet; a single tab gives that group the
 * full width and opens each skill up: what it is for, and how many projects
 * it shipped on, counted off the project tags rather than typed.
 *
 * The marks are brand paths in each brand's own colour (data/tech-icons.ts),
 * the only colour on the sheet besides the tab; a skill that is
 * a discipline rather than a product gets a short mono glyph in the same box.
 */
const EASE = [0.16, 1, 0.3, 1] as const

const GLYPHS: Record<string, string> = {
  'C#': 'C#',
  'Web exploitation': 'WEB',
  Networking: 'NET',
  'Defense & ethics': 'DEF',
  'OCR & NER pipelines': 'OCR',
  'AI & ML': 'AI',
  'Graphic design': 'GFX',
}

// Adobe pulled its marks from simple-icons, so its apps are drawn the way
// they sit in a dock: the two-letter tile in the app's own colours
const TILES: Record<string, { text: string; fg: string; bg: string }> = {
  Photoshop: { text: 'Ps', fg: '#31A8FF', bg: '#001E36' },
  'Premiere Pro': { text: 'Pr', fg: '#9999FF', bg: '#00005B' },
}

function usedIn(sk: Skill) {
  if (!sk.tags?.length) return 0
  return projects.filter((p) => p.tags.some((t) => sk.tags!.includes(t))).length
}

function Mark({ name }: { name: string }) {
  const tile = TILES[name]
  if (tile)
    return (
      <span aria-hidden style={{ background: tile.bg, color: tile.fg, borderColor: tile.fg }} className="grid h-7 w-7 shrink-0 place-items-center rounded-[5px] border font-sans text-[0.8125rem] font-bold leading-none">
        {tile.text}
      </span>
    )
  const d = techIcons[name]
  const c = techColors[name]
  if (d)
    return (
      <svg aria-hidden viewBox="0 0 24 24" className="h-7 w-7 shrink-0 overflow-visible" style={{ fill: c?.hex ?? '#111' }}>
        <path d={d} stroke={c?.outline ? '#111' : undefined} strokeWidth={c?.outline ? 0.6 : undefined} strokeLinejoin="round" />
      </svg>
    )
  return (
    <span aria-hidden className="grid h-7 min-w-7 shrink-0 place-items-center rounded-[2px] border border-[#111] px-0.5 font-mono text-[0.625rem] font-bold leading-none text-[#111]">
      {GLYPHS[name] ?? name.slice(0, 3).toUpperCase()}
    </span>
  )
}

/** the level, quietly: five ticks, as many inked as Sky's own 1-5 call */
function Ticks({ level, label }: { level: number; label: string }) {
  return (
    <span role="img" aria-label={`${label} ${level}/5`} className="flex gap-[3px]">
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={`h-1.5 w-1.5 ${n <= level ? 'bg-[#111]' : 'bg-[#111]/15'}`} />
      ))}
    </span>
  )
}

export default function StackSheet() {
  const t = ui[useLang()].skills
  const { skills } = useContent()
  const reduce = useReducedMotion()
  const [tab, setTab] = useState<string>('all')
  const tabs = [
    { key: 'all', label: t.all, n: skills.reduce((n, g) => n + g.skills.length, 0) },
    ...skills.map((g) => ({ key: g.key, label: t.tabs[g.key] ?? g.label, n: g.skills.length })),
  ]
  const usedLabel = (sk: Skill) => {
    const n = usedIn(sk)
    return n === 0 ? t.unused : n === 1 ? t.usedOne : fmt(t.used, { n })
  }

  return (
    <div>
      {/* printed file-folder labels on the sheet's top edge; they scroll on a phone */}
      <div role="tablist" aria-label={t.title} className="-mb-px flex gap-1 overflow-x-auto pl-3 [scrollbar-width:none] sm:justify-end sm:pr-3">
        {tabs.map((x) => {
          const on = x.key === tab
          return (
            <button
              key={x.key}
              role="tab"
              type="button"
              aria-selected={on}
              onClick={() => setTab(x.key)}
              data-cursor-label="switch"
              className={`relative shrink-0 rounded-t-[3px] border border-b-0 px-4 py-2 font-mono text-[0.8125rem] font-bold uppercase tracking-[0.1em] text-[#111] transition-colors th:tracking-normal sm:min-w-[7rem] ${
                on ? 'z-10 border-[#111] bg-accent' : 'border-[#111]/30 bg-[#ebe7dc] hover:bg-white'
              }`}
            >
              {x.label} <span className="ml-1 font-normal opacity-55">{x.n}</span>
            </button>
          )
        })}
      </div>
      <div className="relative border border-dashed border-[#111]/40 bg-white/60 px-4 py-2 sm:px-6">
        {/* Every view is rendered, stacked in one grid cell, and only the
            picked one shows. The cell is as tall as the tallest view, so
            switching tabs never changes the sheet's height and the page under
            it never jumps; swapping one view for another (it used to) shrank
            the sheet to the group and pulled everything below it up. */}
        <div className="grid">
          {tabs.map(({ key: view }) => {
            const on = view === tab
            return (
              <motion.div
                key={view}
                initial={false}
                animate={on ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
                transition={{ duration: reduce ? 0 : on ? 0.38 : 0.15, delay: on && !reduce ? 0.08 : 0, ease: EASE }}
                aria-hidden={!on}
                inert={!on}
                className={`[grid-area:1/1] ${on ? '' : 'pointer-events-none'}`}
              >
                {(view === 'all' ? skills : skills.filter((g) => g.key === view)).map((g) => (
                  // all groups: a label column down the left, like a reference
                  // sheet; one group: the tab already names it, so the marks get
                  // the full width
                  <div
                    key={g.key}
                    className={`grid gap-4 border-b border-[#111]/12 py-5 last:border-b-0 ${view === 'all' ? 'md:grid-cols-[9rem_minmax(0,1fr)]' : ''}`}
                  >
                    {view === 'all' && (
                      <span className="pt-1 font-mono text-[0.8125rem] font-bold uppercase tracking-[0.08em] text-fg th:tracking-normal">
                        {t.tabs[g.key] ?? g.label}
                      </span>
                    )}
                    {view === 'all' ? (
                      <ul className="grid grid-cols-2 gap-x-3 gap-y-5 min-[480px]:grid-cols-3 md:grid-cols-5 xl:grid-cols-11">
                        {g.skills.map((s) => (
                          <li key={s.name} className="flex flex-col items-center gap-2 text-center">
                            <Mark name={s.name} />
                            <span className="font-mono text-[0.8125rem] leading-tight text-fg">{s.name}</span>
                            <Ticks level={s.level} label={t.level} />
                          </li>
                        ))}
                      </ul>
                    ) : (
                      // one group picked: the same marks, now with what each is for
                      <ul className="grid gap-x-8 gap-y-6 md:grid-cols-2 xl:grid-cols-3">
                        {g.skills.map((s) => (
                          <li key={s.name} className="flex gap-3.5">
                            <Mark name={s.name} />
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                                <span className="font-mono text-[0.875rem] font-bold text-fg">{s.name}</span>
                                <Ticks level={s.level} label={t.level} />
                              </div>
                              <p className="mt-1 font-sans text-[0.875rem] leading-snug text-fg-muted th:leading-[1.7]">{s.note}</p>
                              <p className="mt-1.5 font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-fg-dim th:tracking-normal">{usedLabel(s)}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
