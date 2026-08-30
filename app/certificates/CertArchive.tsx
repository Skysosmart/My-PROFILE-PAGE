'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import CertCard from '@/components/ui/CertCard'
import CertLightbox from '@/components/ui/CertLightbox'
import { CATS, groupByCategory, certStats } from '@/lib/certs'
import type { Certificate } from '@/data/portfolio'

/**
 * The full archive, on its own page so the home section can stay a preview.
 *
 * Deliberately plain for now: same cards, same record view, no section chrome
 * and no reveal choreography. It exists so "Explore all" has somewhere real to
 * land rather than a dead link, and is the thing to design properly next.
 */
export default function CertArchive() {
  const [cat, setCat] = useState('all')
  const [active, setActive] = useState<Certificate | null>(null)
  const byCat = useMemo(groupByCategory, [])
  const items = byCat.get(cat) ?? []

  return (
    <main className="relative z-10 min-h-screen px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto w-full max-w-7xl">
        <Link
          href="/#certificates"
          className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-white/45 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <span aria-hidden>←</span> Back to portfolio
        </Link>

        <h1 className="mt-5 font-crt text-4xl leading-none text-white sm:text-6xl">CERTIFICATES</h1>

        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 border-y border-white/12 py-2.5 font-mono text-[11px] uppercase tracking-[0.18em] text-white/40">
          <span>
            <span className="tabular-nums text-white">{certStats.total}</span> records
          </span>
          <span className="text-amber-300/70">
            <span className="tabular-nums text-white">{certStats.gold}</span> gold
          </span>
          <span>
            <span className="tabular-nums text-white">{certStats.national}</span> national
          </span>
          <span>
            <span className="tabular-nums text-white">{certStats.intl}</span> international
          </span>
        </div>

        <div className="my-5 flex flex-wrap gap-2">
          {CATS.map((c) => {
            const on = c.key === cat
            const count = (byCat.get(c.key) ?? []).length
            return (
              <button
                key={c.key}
                onClick={() => setCat(c.key)}
                aria-pressed={on}
                className={`relative rounded-full px-4 py-1.5 font-sans text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70 ${
                  on ? 'text-neutral-900' : 'text-white/70 hover:text-white'
                }`}
              >
                {on && (
                  <motion.span
                    layoutId="archive-pill"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    className="absolute inset-0 rounded-full bg-white shadow-lg"
                  />
                )}
                <span className="relative flex items-center gap-2">
                  <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
                  {c.label}
                  <span className={on ? 'text-neutral-400' : 'text-white/35'}>{count}</span>
                </span>
              </button>
            )
          })}
        </div>

        <div
          key={cat}
          className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {items.map((c, i) => (
            <CertCard key={c.file} cert={c} index={i} onOpen={setActive} />
          ))}
        </div>
      </div>

      <CertLightbox cert={active} onClose={() => setActive(null)} />
    </main>
  )
}
