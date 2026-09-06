'use client'

import { projects } from '@/data/portfolio'
import { certStats } from '@/lib/certs'
import { ui } from '@/data/ui'
import { useLang } from '@/lib/use-lang'

/**
 * Four numbers under the hero, counted off the data so they cannot go stale:
 * certificates, gold medals, national awards, projects. The one place the
 * duck's yellow is allowed on text.
 */
export default function StatsBar({ className = '' }: { className?: string }) {
  const t = ui[useLang()].stats
  const items = [
    { n: certStats.total, label: t.certificates },
    { n: certStats.gold, label: t.gold },
    { n: certStats.national, label: t.national },
    { n: projects.length, label: t.projects },
  ]
  return (
    <dl
      className={`grid grid-cols-4 border-y border-fg/12 bg-panel/66 sm:inline-grid sm:auto-cols-fr sm:grid-flow-col ${className}`}
    >
      {items.map((it, i) => (
        <div
          key={it.label}
          className={`flex flex-col items-center gap-0.5 px-3 py-2.5 sm:px-9 sm:py-3 ${
            i < items.length - 1 ? 'border-r border-fg/12' : ''
          }`}
        >
          <dd className="m-0 font-crt text-3xl leading-none text-duck sm:text-[40px]">{it.n}</dd>
          <dt className="font-mono text-[8px] uppercase tracking-[0.25em] text-fg-muted sm:text-[10px] sm:tracking-[0.3em]">
            {it.label}
          </dt>
        </div>
      ))}
    </dl>
  )
}
