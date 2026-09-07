'use client'

import { useEffect, useState } from 'react'
import LangToggle from '@/components/LangToggle'
import { player } from '@/data/portfolio'
import { ui } from '@/data/ui'
import { certStats } from '@/lib/certs'
import { useLang } from '@/lib/use-lang'

/**
 * The stats bar that closes the page (lamalama.com ends this way): a count,
 * where, the live clock in brackets, the sign-off, and the two toggles. The
 * contact section above it (Ending) is where the reaching-out happens.
 */
export default function Footer() {
  const t = ui[useLang()]
  const [time, setTime] = useState('')
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('en-GB'))
    tick()
    const id = window.setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <footer className="border-t border-fg/12 bg-panel/80 px-4 py-3 sm:px-6">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-8 gap-y-2 font-mono text-[0.625rem] uppercase tracking-[0.22em] text-fg-muted">
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
