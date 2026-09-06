import type { Metadata } from 'next'
import Duck from '@/components/duck/Duck'
import WriteupChrome from '@/components/writeups/WriteupChrome'
import WriteupList from '@/components/writeups/WriteupList'
import { player } from '@/data/portfolio'
import { getWriteups } from '@/lib/writeups'

export const metadata: Metadata = {
  title: `Writeups - ${player.name}`,
  description: `CTF solutions and security notes by ${player.name}: web exploitation, networking, and how a target gets taken apart.`,
  alternates: { canonical: '/writeups' },
}

/**
 * /writeups - every publishable post, newest first. Server-rendered from the
 * MDX on disk, so a search engine and a link preview see the real list, and
 * it never sits behind the boot screen.
 */
export default async function WriteupsPage() {
  const items = await getWriteups()
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col px-4 pb-16 pt-5 sm:px-6">
      <WriteupChrome path="writeups/" />
      <header className="mt-10 flex items-end justify-between gap-6">
        <div className="flex flex-col gap-3">
          <span className="font-mono text-[11px] tracking-[0.35em] text-fg-dim">[ 04 · WRITEUPS ]</span>
          <h1
            className="font-crt text-5xl leading-none text-fg sm:text-6xl"
            style={{ textShadow: '0 0 10px rgb(var(--fg) / 0.5)' }}
          >
            CTF &amp; Security Writeups
          </h1>
          <p className="max-w-xl font-mono text-[12px] leading-relaxed text-fg-muted">
            {items.length} {items.length === 1 ? 'post' : 'posts'} · web exploitation and networking
            first, because those are the roles I play.
          </p>
        </div>
        <Duck pose="hacker" width={200} className="hidden sm:block" />
      </header>
      <div className="mt-8">
        <WriteupList items={items} />
      </div>
    </main>
  )
}
