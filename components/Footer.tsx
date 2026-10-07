'use client'

import { useEffect, useState } from 'react'
import LangToggle from '@/components/LangToggle'
import { player, projects } from '@/data/portfolio'
import { ZARU_MARK } from '@/data/zaru-mark'
import { ui } from '@/data/ui'
import { certStats } from '@/lib/certs'
import { useLang } from '@/lib/use-lang'

/**
 * The end of the page: the ZaruTech lettering with where the site lives and
 * its source, then the stats line (lamalama.com ends this way): a count,
 * where, the live clock in brackets, the sign-off, and the language toggle. The
 * contact section above it (Ending) is where the reaching-out happens.
 */
export default function Footer() {
  const t = ui[useLang()]
  // the site's own repo, from its entry in the projects list
  const source = projects.find((p) => p.repo?.includes('My-PROFILE-PAGE'))?.repo
  const [time, setTime] = useState('')
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('en-GB'))
    tick()
    const id = window.setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <footer className="border-t border-fg/12 px-[clamp(16px,4vw,64px)] pb-4 pt-8">
      {/* the signature: the ZaruTech lettering in ink, where the site lives, its source */}
      <div className="mx-auto mb-6 flex w-full max-w-[92.5rem] flex-wrap items-end justify-between gap-6">
        <svg viewBox={ZARU_MARK.viewBox} role="img" aria-label="ZaruTech" className="h-auto w-36 text-[#111] sm:w-44">
          <g transform={ZARU_MARK.transform} fill="currentColor">
            {ZARU_MARK.letters.map((d, i) => (
              <path key={i} d={d} />
            ))}
            <path d={ZARU_MARK.swoosh} />
          </g>
        </svg>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[0.8125rem] text-fg-muted">
          <a href="https://zarutech.dev" className="text-fg underline-offset-4 hover:underline">
            zarutech.dev
          </a>
          {source && (
            <a href={source} target="_blank" rel="noreferrer" className="underline-offset-4 transition-colors hover:text-fg hover:underline">
              {t.footer.source} ↗
            </a>
          )}
        </div>
      </div>
      <div className="mx-auto flex w-full max-w-[92.5rem] flex-wrap items-center justify-between gap-x-8 gap-y-2 font-mono text-[0.75rem] uppercase tracking-[0.22em] text-fg-muted">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-1">
          <span>
            {certStats.total} {t.stats.certificates}
          </span>
          <span>{t.footer.based}</span>
          <span className="text-fg">
            [ <span className="text-duck">●</span>{' '}
            <span className="tabular-nums tracking-[0.3em]">{time || '--:--:--'}</span> ]
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
          <span>
            {player.handle} · {t.footer.rendered} · © {new Date().getFullYear()}
          </span>
          <span className="flex items-center gap-2 normal-case tracking-normal">
            <LangToggle />
          </span>
        </div>
      </div>
    </footer>
  )
}
