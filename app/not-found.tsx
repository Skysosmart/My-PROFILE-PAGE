'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'
import { player } from '@/data/portfolio'

/**
 * 404 - a shell that cannot find the path. The prompt is the one the
 * certificates page wears; the block letters are pyfiglet's `small`, the
 * same face as every project title. Three things to do next, in the voice
 * of the About terminal, so a wrong URL lands inside the site instead of
 * on the framework's white default.
 */

// pyfiglet -f small 404
const FIGLET = ` _ _   __  _ _
| | | /  \\| | |
|_  _| () |_  _|
  |_| \\__/  |_|`

export default function NotFound() {
  // Read on mount, not with usePathname: this page is prerendered at build
  // time, when no path exists, so rendering one during hydration made the
  // server and client markup disagree - React threw #418/#423/#425 and
  // re-rendered the whole page on the client. Empty on the first paint,
  // filled a frame later.
  const [path, setPath] = useState('')
  useEffect(() => setPath(window.location.pathname), [])
  const handle = player.handle.toLowerCase().replace('.exe', '')

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col px-4 pb-16 pt-5 sm:px-6">
      <div className="flex items-center gap-2 font-mono text-[12px]">
        <span className="shrink-0 select-none">
          <span className="text-fg/70">{handle}</span>
          <span className="text-fg/25">@exe</span>
          <span className="text-fg-dim">:~$</span>
        </span>
        <span className="select-none text-fg-muted">cd</span>
        <span className="min-w-0 truncate text-fg">{path}</span>
        <span className="ml-auto shrink-0">
          <ThemeToggle />
        </span>
      </div>

      <p className="mt-2 font-mono text-[12px] text-red-400">
        zsh: no such file or directory{path ? ': ' : ''}
        <span className="break-all">{path}</span>
      </p>

      <pre
        aria-hidden
        className="mt-10 whitespace-pre font-mono text-[22px] leading-[1.1] text-fg sm:text-[30px]"
        style={{ textShadow: '0 0 14px rgb(var(--fg) / 0.3), 0 0 34px rgb(var(--fg) / 0.12)' }}
      >
        {FIGLET}
      </pre>
      <h1 className="mt-4 font-sans text-lg font-semibold text-fg">Not in this filesystem.</h1>
      <p className="mt-1 max-w-md font-sans text-sm text-fg/70">
        The address may have been mistyped, or the page moved when the site was rebuilt. Everything
        that exists is one of these:
      </p>

      <ul className="mt-6 space-y-1 font-mono text-[13px]">
        {[
          { cmd: 'cd ~', note: 'home', href: '/' },
          { cmd: 'ls certificates/', note: 'every certificate', href: '/certificates' },
          // a plain anchor, not Link: next/link prefetches its target as an
          // RSC payload, and asking a route handler that returns a PDF for
          // one answered 500 on every hover
          { cmd: 'open resume.pdf', note: 'one-page CV', href: '/resume.pdf', file: true },
        ].map((l) => {
          const inner = (
            <>
              <span aria-hidden className="text-green-400">
                &#8594;
              </span>
              <span className="underline-offset-4 group-hover:underline">{l.cmd}</span>
              <span className="text-fg-dim"># {l.note}</span>
            </>
          )
          const cls =
            'group inline-flex min-h-[32px] items-center gap-3 text-fg/85 transition-colors hover:text-fg'
          return (
            <li key={l.href}>
              {l.file ? (
                <a href={l.href} target="_blank" rel="noreferrer" className={cls}>
                  {inner}
                </a>
              ) : (
                <Link href={l.href} className={cls}>
                  {inner}
                </Link>
              )}
            </li>
          )
        })}
      </ul>

      <div className="mt-auto pt-16">
        <div className="ascii-rule opacity-40" />
        <p className="mt-3 font-mono text-[11px] text-fg-dim">exit code 404</p>
      </div>
    </main>
  )
}
