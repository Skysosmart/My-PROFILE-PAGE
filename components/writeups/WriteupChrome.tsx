'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import ThemeToggle from '@/components/ThemeToggle'
import LangToggle from '@/components/LangToggle'
import { player } from '@/data/portfolio'
import { ui } from '@/data/ui'
import { useLang } from '@/lib/use-lang'

/**
 * The prompt line every page off the one-pager wears: the same prompt as the
 * header, the path you are on, a way back, the two toggles. Built for the
 * writeups; the certificates archive carries its own older copy.
 */
export default function WriteupChrome({ path }: { path: string }) {
  const lang = useLang()
  const t = ui[lang]
  const [time, setTime] = useState('')
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('en-GB'))
    tick()
    const id = window.setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])
  const handle = player.handle.toLowerCase().replace('.exe', '')

  return (
    <div className="flex items-center gap-2 font-mono text-[12px]">
      <span className="shrink-0 select-none">
        <span className="text-fg/70">{handle}</span>
        <span className="text-fg/25">@exe</span>
        <span className="text-fg-dim">:~$</span>
      </span>
      <span className="select-none text-fg-muted">cd</span>
      <span className="min-w-0 truncate text-fg">{path}</span>
      <span className="ml-auto flex shrink-0 items-center gap-3">
        <Link
          href="/"
          className="text-fg-muted underline-offset-4 transition-colors hover:text-fg hover:underline"
        >
          ← {t.writeups.back}
        </Link>
        <span className="hidden tabular-nums tracking-widest text-fg-dim sm:inline">
          {time || '--:--:--'}
        </span>
        <LangToggle />
        <ThemeToggle />
      </span>
    </div>
  )
}
