'use client'

import Link from 'next/link'
import Duck from '@/components/duck/Duck'
import WriteupList from '@/components/writeups/WriteupList'
import SectionHeading from '@/components/ui/SectionHeading'
import { ui } from '@/data/ui'
import { useLang } from '@/lib/use-lang'
import type { WriteupMeta } from '@/lib/writeups'
import { useTint } from '@/lib/tint'

/**
 * The three newest writeups on the one-pager, as a folder listing, with the
 * way to the full index. Hidden entirely while there is nothing to show:
 * an empty section is worse than no section.
 */
export default function WriteupsTeaser({ items }: { items: WriteupMeta[] }) {
  const lang = useLang()
  const t = ui[lang]
  const ref = useTint('writeups')
  if (items.length === 0) return null

  return (
    <section ref={ref} id="writeups" className="relative isolate scroll-mt-28 px-[clamp(16px,4vw,64px)] py-14 sm:py-20">
      <div
        aria-hidden
        className="pointer-events-none absolute right-4 top-0 -z-10 select-none font-crt text-[12.5rem] leading-none text-fg/[0.04] sm:text-[18.75rem]"
      >
        LOGS
      </div>
      <div className="mx-auto w-full max-w-[92.5rem]">
        <SectionHeading index="06" label={t.writeups.title} command="ls ~/writeups" subtitle={t.writeups.teaser}>
          {/* hacker mode, the drawing with its own scene */}
          <div className="absolute bottom-0 right-0 hidden sm:block">
            <Duck pose="hacker" width={180} parallax={4} className="lg:!w-[13.75rem]" />
          </div>
        </SectionHeading>
        <WriteupList items={items} limit={3} />
        <div className="mt-5">
          <Link
            href="/writeups"
            data-cursor-label="all writeups"
            className="inline-flex min-h-[2.25rem] items-center gap-2 rounded-[3px] border border-fg/30 px-4 font-mono text-[0.8125rem] text-fg/85 transition-colors hover:border-fg/60 hover:text-fg"
          >
            {t.writeups.all} →
          </Link>
        </div>
      </div>
    </section>
  )
}
