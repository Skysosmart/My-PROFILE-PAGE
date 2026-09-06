'use client'

import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import GlassSection from '@/components/ui/GlassSection'
import { projects, type Skill } from '@/data/portfolio'
import { fmt, ui } from '@/data/ui'
import { useContent } from '@/lib/use-content'
import { useLang } from '@/lib/use-lang'

/**
 * 03 · SKILLS - the inventory, laid out the way sirayuth.com lays out its
 * skills and dressed in this site's clothes: one row of wide tabs, one per
 * group with its count; under it the group's skills as rows with a
 * five-glyph level bar; beside them the picked skill opened up as a
 * terminal readout with its note and the projects it was used in, which
 * are counted off the project tags. Flat on the page, no panel.
 *
 * Click or arrow through the rows; the tabs answer to the keyboard too.
 */
const SEGMENTS = [1, 2, 3, 4, 5] as const

function usedIn(sk: Skill) {
  if (!sk.tags?.length) return []
  return projects.filter((p) => p.tags.some((t) => sk.tags!.includes(t)))
}

/** five glyphs, lit to the level; the lit ones arrive one by one when `animate` */
function Bar({ level, lit = false, animate = false, size = 'sm' }: { level: number; lit?: boolean; animate?: boolean; size?: 'sm' | 'lg' }) {
  const reduce = useReducedMotion()
  const box = size === 'lg' ? 'h-4 w-7' : 'h-2.5 w-3.5'
  return (
    <span aria-label={`level ${level} of 5`} className="inline-flex gap-[0.2rem]">
      {SEGMENTS.map((n) => {
        const on = n <= level
        return (
          <motion.span
            key={n}
            initial={animate && !reduce ? { opacity: 0, scaleY: 0.2 } : false}
            animate={{ opacity: 1, scaleY: 1 }}
            transition={{ delay: animate ? n * 0.06 : 0, duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className={`${box} rounded-[0.125rem] ${on ? (lit ? 'bg-duck shadow-[0_0_10px_rgb(245_190_91/0.5)]' : 'bg-fg/80') : 'border border-fg/20'}`}
          />
        )
      })}
    </span>
  )
}

export default function Skills() {
  const lang = useLang()
  const t = ui[lang].skills
  const { skills } = useContent()
  const reduce = useReducedMotion()

  const [group, setGroup] = useState(0)
  const [picked, setPicked] = useState(skills[0].skills[0].name)
  const active = skills[group]
  const current = useMemo(
    () => active.skills.find((s) => s.name === picked) ?? active.skills[0],
    [active, picked],
  )
  const used = usedIn(current)
  const usedLabel = (sk: Skill) => {
    const n = usedIn(sk).length
    return n === 0 ? t.unused : n === 1 ? t.usedOne : fmt(t.used, { n })
  }

  // a new group opens on its first skill
  const openGroup = (gi: number) => {
    setGroup(gi)
    setPicked(skills[gi].skills[0].name)
  }
  // arrows walk the rows, left/right the tabs
  const onKey = (e: React.KeyboardEvent) => {
    const i = active.skills.findIndex((s) => s.name === current.name)
    if (e.key === 'ArrowDown') { e.preventDefault(); setPicked(active.skills[(i + 1) % active.skills.length].name) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setPicked(active.skills[(i - 1 + active.skills.length) % active.skills.length].name) }
    else if (e.key === 'ArrowRight') { e.preventDefault(); openGroup((group + 1) % skills.length) }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); openGroup((group - 1 + skills.length) % skills.length) }
  }
  // keep the pick valid if the language flips the names under it
  useEffect(() => {
    if (!active.skills.some((s) => s.name === picked)) setPicked(active.skills[0].name)
  }, [active, picked])

  const total = skills.reduce((n, g) => n + g.skills.length, 0)

  return (
    <GlassSection
      id="skills"
      index="03"
      title={t.title}
      label={`03 · ${t.label}`}
      watermark="SKILLS"
      variant="rise"
      revealAmount="some"
      panel={false}
    >
      <div className="mx-auto w-full max-w-6xl">
        <p className="mb-8 max-w-2xl font-sans text-[0.9375rem] leading-relaxed text-fg-muted sm:mb-10">
          {fmt(t.intro, { n: total, g: skills.length })}
        </p>

        {/* the tabs: one per group, with its count */}
        <div role="tablist" aria-label={t.title} className="grid grid-cols-2 gap-2 lg:grid-cols-4" onKeyDown={onKey}>
          {skills.map((g, gi) => {
            const on = gi === group
            return (
              <button
                key={g.key}
                role="tab"
                aria-selected={on}
                type="button"
                onClick={() => openGroup(gi)}
                className={`flex min-h-[3.5rem] items-center justify-between gap-3 rounded-md border px-4 py-3 text-left transition-colors focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg ${
                  on ? 'border-fg bg-fg text-bg' : 'border-fg/15 bg-panel/40 text-fg/80 hover:border-fg/45 hover:text-fg'
                }`}
              >
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className={`font-mono text-[0.625rem] uppercase tracking-[0.3em] ${on ? 'text-bg/60' : 'text-fg-dim'}`}>
                    {String(gi + 1).padStart(2, '0')} / {g.skills.length}
                  </span>
                  <span className="font-sans text-[0.875rem] font-bold leading-tight sm:truncate sm:text-[0.9375rem]">{g.label}</span>
                </span>
                <span aria-hidden className={`shrink-0 font-mono text-sm ${on ? 'text-duck' : 'text-fg/30'}`}>
                  {on ? '▶' : '▷'}
                </span>
              </button>
            )
          })}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-10" onKeyDown={onKey}>
          {/* the rows */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.ul
              key={active.key}
              role="listbox"
              aria-label={active.label}
              initial={reduce ? { opacity: 0 } : { opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, x: 12 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col border-t border-fg/12"
            >
              {active.skills.map((sk, i) => {
                const on = sk.name === current.name
                return (
                  <li key={sk.name} role="option" aria-selected={on}>
                    <button
                      type="button"
                      onClick={() => setPicked(sk.name)}
                      onMouseEnter={() => setPicked(sk.name)}
                      className={`group flex w-full items-center gap-4 border-b border-fg/12 px-2 py-4 text-left transition-colors focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg sm:px-3 ${
                        on ? 'bg-fg/[0.06]' : 'hover:bg-fg/[0.04]'
                      }`}
                    >
                      <span className={`w-6 shrink-0 font-mono text-[0.6875rem] ${on ? 'text-duck' : 'text-fg-dim'}`}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className={`min-w-0 flex-1 truncate font-sans text-[0.9375rem] font-semibold ${on ? 'text-fg' : 'text-fg/85'}`}>
                        {sk.name}
                      </span>
                      <span className="hidden shrink-0 font-mono text-[0.625rem] uppercase tracking-[0.2em] text-fg-dim sm:inline">
                        {usedLabel(sk)}
                      </span>
                      <Bar level={sk.level} lit={on} />
                      <span className={`w-8 shrink-0 text-right font-mono text-[0.75rem] tabular-nums ${on ? 'text-fg' : 'text-fg-muted'}`}>
                        {sk.level}/5
                      </span>
                    </button>
                  </li>
                )
              })}
            </motion.ul>
          </AnimatePresence>

          {/* the readout */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={current.name}
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="relative flex flex-col gap-5 rounded-xl border border-fg/15 bg-panel/50 p-6 sm:p-8"
              >
                {/* the level, faded, behind */}
                <span aria-hidden className="pointer-events-none absolute right-6 top-4 select-none font-crt text-[6rem] leading-none text-fg/[0.05]">
                  {current.level}
                  <span className="text-[3rem]">/5</span>
                </span>

                <span className="font-mono text-[0.6875rem] text-fg-dim">
                  <span className="text-duck">$</span> skill --show &quot;{current.name}&quot;
                </span>
                <div className="flex flex-col gap-3">
                  <span className="font-crt text-5xl leading-none text-fg sm:text-6xl">{current.name}</span>
                  <span className="flex flex-wrap items-center gap-3 font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-fg-dim">
                    {t.level}
                    <Bar level={current.level} lit animate size="lg" />
                    <span className="text-fg">{current.level} / 5</span>
                  </span>
                </div>
                <p className="max-w-md font-sans text-[0.9375rem] leading-relaxed text-fg/85">{current.note}</p>
                <div className="flex flex-col gap-2 border-t border-fg/12 pt-4">
                  <span className="font-mono text-[0.625rem] uppercase tracking-[0.25em] text-fg-dim">{usedLabel(current)}</span>
                  {used.length > 0 && (
                    <ul className="flex flex-col gap-1">
                      {used.map((p) => (
                        <li key={p.title} className="truncate font-mono text-[0.75rem] text-fg/80">
                          <span aria-hidden className="text-duck">
                            ›{' '}
                          </span>
                          {p.title.split(' - ')[0]}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <span className="font-mono text-[0.625rem] uppercase tracking-[0.2em] text-fg/30">{t.keys}</span>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </GlassSection>
  )
}
