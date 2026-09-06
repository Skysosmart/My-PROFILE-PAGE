'use client'

import Link from 'next/link'
import Emote from '@/components/duck/Emote'
import type { WriteupMeta } from '@/lib/writeups'
import { fmt, ui } from '@/data/ui'
import { useLang } from '@/lib/use-lang'

/**
 * Writeups as a folder listing (the shape cartooneast.in gives its Works):
 * icon, title, one line of meta, the difficulty on the right. Used by the
 * /writeups index and, with `limit`, by the teaser on the one-pager.
 */
export default function WriteupList({
  items,
  limit,
}: {
  items: WriteupMeta[]
  limit?: number
}) {
  const lang = useLang()
  const t = ui[lang]
  const shown = limit ? items.slice(0, limit) : items

  if (shown.length === 0) {
    return (
      <p className="flex items-center gap-4 border-t border-fg/10 py-8 font-mono text-[0.75rem] text-fg-muted">
        <Emote name="question" size={56} />
        {t.writeups.empty}
      </p>
    )
  }

  return (
    <ul className="border-t border-fg/10">
      {shown.map((w) => (
        <li key={w.slug}>
          <Link
            href={`/writeups/${w.slug}`}
            className="group flex items-center gap-4 border-b border-fg/10 px-2 py-4 transition-colors hover:bg-fg/[0.04] sm:px-4"
          >
            <svg
              aria-hidden
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
              className="shrink-0 text-fg/70"
            >
              {w.category === 'notes' ? (
                <>
                  <path d="M14 3H6a1.5 1.5 0 0 0-1.5 1.5v15A1.5 1.5 0 0 0 6 21h12a1.5 1.5 0 0 0 1.5-1.5V8.5L14 3Z" />
                  <path d="M14 3v5.5h5.5" />
                </>
              ) : (
                <path d="M3 6.5A1.5 1.5 0 0 1 4.5 5h4l2 2h9A1.5 1.5 0 0 1 21 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5v-11Z" />
              )}
            </svg>
            <span className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="font-sans text-[0.9375rem] font-semibold text-fg group-hover:underline group-hover:underline-offset-4">
                {w.title}
              </span>
              <span className="truncate font-mono text-[0.625rem] uppercase tracking-[0.2em] text-fg-dim">
                {[w.event, w.date, w.category, fmt(t.writeups.minutes, { n: w.minutes })]
                  .filter(Boolean)
                  .join(' · ')}
                {w.tags.length > 0 && (
                  <span className="normal-case tracking-normal text-fg-muted"> · {w.tags.join(', ')}</span>
                )}
              </span>
            </span>
            {w.draft && (
              <span className="shrink-0 font-mono text-[0.5625rem] uppercase tracking-[0.2em] text-fg-dim">
                {t.writeups.draft}
              </span>
            )}
            {w.difficulty && (
              <span className="shrink-0 rounded-sm border border-duck/70 px-2 py-0.5 font-mono text-[0.5625rem] uppercase tracking-[0.2em] text-duck">
                {w.difficulty}
              </span>
            )}
            <span aria-hidden className="shrink-0 font-mono text-fg/50 transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
