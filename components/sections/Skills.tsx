'use client'

import { useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import GlassSection from '@/components/ui/GlassSection'
import { projects, type Skill } from '@/data/portfolio'
import { fmt, ui } from '@/data/ui'
import { useContent } from '@/lib/use-content'
import { useLang } from '@/lib/use-lang'

/**
 * 03 · SKILLS - the inventory, the way sirayuth.com lays it out: groups on
 * the left, each skill with a level bar, and the picked one opened up on
 * the right with its note and the projects it was used in. The level is
 * five segments in the terminal's own glyphs; the project count is
 * counted off the project tags, so it cannot go stale.
 */
const SEGMENTS = [1, 2, 3, 4, 5] as const

function usedIn(sk: Skill) {
  if (!sk.tags?.length) return []
  return projects.filter((p) => p.tags.some((t) => sk.tags!.includes(t)))
}

function Bar({ level, on = false }: { level: number; on?: boolean }) {
  return (
    <span aria-label={`level ${level} of 5`} className="inline-flex gap-[3px]">
      {SEGMENTS.map((n) => (
        <span
          key={n}
          className={`h-2.5 w-3 rounded-[2px] ${
            n <= level ? (on ? 'bg-duck' : 'bg-fg/80') : 'border border-fg/20'
          }`}
        />
      ))}
    </span>
  )
}

export default function Skills() {
  const lang = useLang()
  const t = ui[lang].skills
  const { skills } = useContent()
  const reduce = useReducedMotion()
  const [picked, setPicked] = useState(skills[0].skills[0].name)
  const current = useMemo(
    () => skills.flatMap((g) => g.skills).find((s) => s.name === picked) ?? skills[0].skills[0],
    [skills, picked],
  )
  const used = usedIn(current)
  const usedLabel = (sk: Skill) => {
    const n = usedIn(sk).length
    return n === 0 ? t.unused : n === 1 ? t.usedOne : fmt(t.used, { n })
  }

  return (
    <GlassSection
      id="skills"
      index="03"
      title={t.title}
      label={`03 · ${t.label}`}
      watermark="SKILLS"
      variant="rise"
      revealAmount="some"
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-8">
        {/* the groups */}
        <div className="grid gap-4 sm:grid-cols-2">
          {skills.map((g, gi) => (
            <div key={g.key} className="flex flex-col gap-2 rounded-xl border border-fg/12 bg-panel/66 p-4">
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-fg-dim">
                  {String(gi + 1).padStart(2, '0')} / {g.label}
                </span>
                <span className="font-mono text-[10px] text-fg-dim">{g.skills.length}</span>
              </div>
              <ul className="flex flex-col">
                {g.skills.map((sk) => {
                  const on = sk.name === current.name
                  return (
                    <li key={sk.name}>
                      <button
                        type="button"
                        onClick={() => setPicked(sk.name)}
                        aria-pressed={on}
                        className={`flex w-full items-center justify-between gap-3 rounded-md px-2 py-1.5 text-left transition-colors ${
                          on ? 'bg-fg/10' : 'hover:bg-fg/[0.05]'
                        }`}
                      >
                        <span className={`font-sans text-[13px] font-semibold ${on ? 'text-fg' : 'text-fg/85'}`}>
                          {sk.name}
                        </span>
                        <Bar level={sk.level} on={on} />
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* the picked skill */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.3em] text-fg-dim">{t.hint}</span>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={current.name}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="term-window flex flex-col gap-4 rounded-xl p-5"
            >
              <div className="flex flex-col gap-1">
                <span className="font-crt text-4xl leading-none text-fg">{current.name}</span>
                <span className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-fg-dim">
                  {t.level} <Bar level={current.level} on />
                </span>
              </div>
              <p className="font-sans text-[13px] leading-relaxed text-fg/85">{current.note}</p>
              <div className="flex flex-col gap-1.5 border-t border-fg/10 pt-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-fg-dim">{usedLabel(current)}</span>
                {used.length > 0 && (
                  <ul className="flex flex-col gap-0.5">
                    {used.map((p) => (
                      <li key={p.title} className="truncate font-mono text-[11px] text-fg/75">
                        <span aria-hidden className="text-duck">
                          ›{' '}
                        </span>
                        {p.title.split(' - ')[0]}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </GlassSection>
  )
}
