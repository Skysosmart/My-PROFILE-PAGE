'use client'

import Link from 'next/link'
import Duck from '@/components/duck/Duck'
import WriteupList from '@/components/writeups/WriteupList'
import { ui } from '@/data/ui'
import { useLang } from '@/lib/use-lang'
import type { WriteupMeta } from '@/lib/writeups'

/**
 * The three newest writeups on the one-pager, as a folder listing, with the
 * way to the full index. Hidden entirely while there is nothing to show:
 * an empty section is worse than no section.
 */
export default function WriteupsTeaser({ items }: { items: WriteupMeta[] }) {
  const lang = useLang()
  const t = ui[lang]
  if (items.length === 0) return null

  return (
    <section id="writeups" className="relative isolate scroll-mt-28 px-4 py-10 sm:px-6 sm:py-14">
      <div
        aria-hidden
        className="pointer-events-none absolute right-4 top-0 -z-10 select-none font-crt text-[12.5rem] leading-none text-fg/[0.04] sm:text-[18.75rem]"
      >
        LOGS
      </div>
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-7 flex items-end justify-between gap-6 pb-4">
          <div className="flex flex-col gap-2">
            <span className="font-mono text-[0.6875rem] tracking-[0.35em] text-fg-dim">[ 06 · WRITEUPS ]</span>
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-xs text-fg-dim">06</span>
              <h2 className="font-mono text-lg font-bold uppercase tracking-[0.2em] text-fg txt-glow sm:text-xl">
                {t.writeups.title}
              </h2>
            </div>
            <p className="font-mono text-[0.75rem] text-fg-muted">{t.writeups.teaser}</p>
          </div>
          {/* hacker mode, the drawing with its own scene */}
          <Duck pose="hacker" width={180} parallax={4} className="hidden sm:block lg:!w-[13.75rem]" />
        </div>
        <WriteupList items={items} limit={3} />
        <div className="mt-5">
          <Link
            href="/writeups"
            data-cursor-label="all writeups"
            className="inline-flex min-h-[2.25rem] items-center gap-2 rounded-full border border-fg/25 px-4 font-mono text-[0.6875rem] text-fg/85 transition-colors hover:border-fg/60 hover:text-fg"
          >
            {t.writeups.all} →
          </Link>
        </div>
      </div>
    </section>
  )
}
