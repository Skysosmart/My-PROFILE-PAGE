'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import CertCard from '@/components/ui/CertCard'
import CertLightbox from '@/components/ui/CertLightbox'
import { CATS, groupByCategory, certStats } from '@/lib/certs'
import type { Certificate } from '@/data/portfolio'

/**
 * The full archive: every certificate, laid out as a plain scrolling grid.
 *
 * Deliberately quiet. The cards are all the same size in a fixed number of
 * columns, so the eye can run down a column without anything moving, resizing
 * or blurring underneath it. The only interaction is the filter and the
 * lightbox.
 */
export default function CertArchive() {
  const [cat, setCat] = useState('all')
  const [active, setActive] = useState<Certificate | null>(null)
  const [still, setStill] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setStill(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  const byCat = useMemo(groupByCategory, [])
  const list = byCat.get(cat) ?? []

  return (
    <main className="min-h-screen bg-neutral-950 pb-24 text-white">
      {/* the bar stays put so the filter is always reachable down a long grid */}
      <header className="sticky top-0 z-20 border-b border-white/10 bg-neutral-950/90 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Link
              href="/#certificates"
              className="shrink-0 font-mono text-[11px] uppercase tracking-wider text-white/50 transition-colors hover:text-white"
            >
              &#8592; Back
            </Link>
            <h1 className="shrink-0 font-crt text-2xl leading-none sm:text-3xl">CERTIFICATES</h1>
            <span className="shrink-0 font-mono text-[11px] uppercase tracking-wider text-white/40">
              {certStats.total} records · {certStats.gold} gold · {certStats.national} national
            </span>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {CATS.map((c) => {
              const on = c.key === cat
              const n = (byCat.get(c.key) ?? []).length
              return (
                <button
                  key={c.key}
                  onClick={() => setCat(c.key)}
                  aria-pressed={on}
                  className={`rounded-full px-3 py-1 font-sans text-[12px] font-medium transition-colors ${
                    on
                      ? 'bg-white text-neutral-900'
                      : 'border border-white/15 text-white/60 hover:border-white/50 hover:text-white'
                  }`}
                >
                  {c.label}
                  <span className={on ? 'ml-1.5 text-neutral-400' : 'ml-1.5 text-white/30'}>{n}</span>
                </button>
              )
            })}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">
        <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((c, i) => (
            // keyed on the filter too, so switching category re-runs the
            // entrance instead of cross-fading one cert into another
            <CertCard key={`${cat}:${c.file}`} cert={c} index={i} still={still} onOpen={setActive} />
          ))}
        </div>

        {list.length === 0 && (
          <p className="py-20 text-center font-mono text-sm text-white/40">Nothing in this category.</p>
        )}
      </div>

      <CertLightbox cert={active} onClose={() => setActive(null)} />
    </main>
  )
}
