import type { Metadata } from 'next'
import Link from 'next/link'
import Duck from '@/components/duck/Duck'

/**
 * Easter egg #2, the easy one. Nothing links here: the only way in is the
 * Disallow line in /robots.txt, the first file anyone curious opens.
 * (Egg #1 is the XOR'd div at the top of <body> in app/layout.tsx.)
 */

export const metadata: Metadata = {
  title: 'duck-pond',
  robots: { index: false, follow: false },
}

export default function DuckPond() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col px-4 pb-16 pt-5 sm:px-6">
      <div className="flex items-center gap-2 font-mono text-[0.75rem]">
        <span className="select-none text-fg-dim">~$</span>
        <span className="select-none text-fg-muted">cat</span>
        <span className="text-fg">/duck-pond/secret.txt</span>
      </div>

      <div className="mt-10 flex flex-wrap items-end gap-8">
        <Duck pose="sleep" width={200} />
      </div>
      <h1 className="mt-4 font-sans text-lg font-semibold text-fg">You found the pond.</h1>
      <p className="mt-1 max-w-md font-sans text-sm text-fg/70">
        robots.txt told the crawlers to stay out. You read it anyway. The secret:
      </p>
      <p
        className="mt-6 break-all font-mono text-xl text-green-400 sm:text-2xl"
        style={{ textShadow: '0 0 14px rgb(74 222 128 / 0.35)' }}
      >
        TakeRewardsfrom_miss_oil_and_miss_au
      </p>
      <p className="mt-6 font-mono text-[0.75rem] text-fg-dim">
        # one more is hidden in the page source. binary first, then base64.
      </p>

      <div className="mt-auto pt-16">
        <Link href="/" className="font-mono text-[0.8125rem] text-fg/85 underline-offset-4 hover:underline">
          &#8594; cd ~
        </Link>
      </div>
    </main>
  )
}
