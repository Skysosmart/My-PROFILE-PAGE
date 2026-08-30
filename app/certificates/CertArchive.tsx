'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import CertCard from '@/components/ui/CertCard'
import CertLightbox from '@/components/ui/CertLightbox'
import { CATS, byNewest, certMatches, certSpan, certStats, groupByCategory } from '@/lib/certs'
import { player, type Certificate } from '@/data/portfolio'

/**
 * ~/certificates - every certificate, newest first.
 *
 * Two controls and nothing else: a search box and the same row of category
 * pills the home section uses. An earlier pass had stacked facets, a live
 * command line, sort keys and a second view, and you met roughly twenty
 * controls before you met a certificate. Anything a visitor would not reach for
 * on their first look is gone; what is left is worth its space.
 *
 * The keyboard extras stayed only because they cost no screen: left and right
 * flip through the open certificate, escape closes it.
 */
export default function CertArchive() {
  const [cat, setCat] = useState('all')
  const [query, setQuery] = useState('')
  const [active, setActive] = useState<Certificate | null>(null)
  const [still, setStill] = useState(false)
  const [time, setTime] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setStill(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  // the same live clock the nav prompt carries
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('en-GB'))
    tick()
    const id = window.setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  const byCat = useMemo(groupByCategory, [])
  const list = useMemo(
    () => byNewest((byCat.get(cat) ?? []).filter((c) => certMatches(c, query))),
    [byCat, cat, query],
  )

  // arrows flip through the certificate that is open - no on-screen control,
  // so it costs nothing to anyone who never tries it
  useEffect(() => {
    if (!active) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
      const from = list.findIndex((c) => c.file === active.file)
      if (from < 0 || list.length < 2) return
      e.preventDefault()
      setActive(list[(from + (e.key === 'ArrowRight' ? 1 : -1) + list.length) % list.length])
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, list])

  const handle = player.handle.toLowerCase().replace('.exe', '')

  return (
    <main className="min-h-screen pb-20">
      {/* ---------- title ------------------------------------------------------ */}
      <div className="mx-auto max-w-7xl px-4 pt-5 sm:px-6">
        <div className="flex items-center gap-2 font-mono text-[12px]">
          <span className="shrink-0 select-none">
            <span className="text-white/70">{handle}</span>
            <span className="text-white/25">@exe</span>
            <span className="text-white/40">:~$</span>
          </span>
          <span className="select-none text-white/55">cd</span>
          <span className="caret text-white">certificates/</span>
          <Link
            href="/#certificates"
            className="ml-auto shrink-0 text-white/40 transition-colors hover:text-white"
          >
            &#8592; back
          </Link>
          <span className="hidden shrink-0 select-none tabular-nums tracking-widest text-white/25 sm:inline">
            {time || '--:--:--'}
          </span>
        </div>

        <h1 className="mt-3 font-crt text-6xl leading-[0.85] tracking-[0.06em] text-white txt-glow sm:text-7xl lg:text-8xl">
          CERTIFICATES
        </h1>
        <p className="mt-2 font-mono text-[11px] text-white/40 sm:text-xs">
          {certStats.total} records · {certStats.gold} gold · {certStats.national} national ·{' '}
          {certStats.intl} international · {certSpan}
        </p>
      </div>

      {/* ---------- search + categories, and that is the whole control set ------ */}
      <div className="sticky top-0 z-30 mt-5 border-y border-white/10 bg-black/85 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex min-w-0 flex-1 basis-56 items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 transition-colors focus-within:border-white/45 sm:max-w-xs">
              <span aria-hidden className="shrink-0 text-white/35">
                &#9906;
              </span>
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search certificates"
                aria-label="Search certificates"
                className="min-w-0 flex-1 bg-transparent font-sans text-sm text-white caret-white outline-none placeholder:text-white/35"
              />
              {query && (
                <button
                  onClick={() => {
                    setQuery('')
                    searchRef.current?.focus()
                  }}
                  aria-label="Clear search"
                  className="shrink-0 text-white/35 transition-colors hover:text-white"
                >
                  &#10005;
                </button>
              )}
            </label>

            <span className="shrink-0 font-mono text-[11px] text-white/35">
              {list.length === certStats.total
                ? `${certStats.total} certificates`
                : `${list.length} of ${certStats.total}`}
            </span>
          </div>

          {/* the same pill control as the home section, same spring */}
          <div className="mt-2.5 flex flex-wrap gap-2">
            {CATS.map((c) => {
              const on = c.key === cat
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
                      layoutId="cert-pill-archive"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                      className="absolute inset-0 rounded-full bg-white shadow-lg"
                    />
                  )}
                  <span className="relative flex items-center gap-2">
                    <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
                    {c.label}
                    <span className={on ? 'text-neutral-400' : 'text-white/35'}>
                      {(byCat.get(c.key) ?? []).length}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ---------- the certificates ------------------------------------------- */}
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
        {list.length === 0 ? (
          <div className="glass-panel rounded-2xl px-6 py-20 text-center">
            <p className="font-sans text-white/70">No certificates match &ldquo;{query}&rdquo;</p>
            <button
              onClick={() => {
                setQuery('')
                setCat('all')
              }}
              className="mt-4 rounded-full border border-white/25 px-4 py-1.5 font-sans text-sm text-white/80 transition-colors hover:border-white/60 hover:text-white"
            >
              Show all {certStats.total}
            </button>
          </div>
        ) : (
          <div className="glass-panel rounded-2xl p-4 sm:p-5">
            <div className="grid grid-cols-2 items-stretch gap-4 lg:grid-cols-3 xl:grid-cols-4">
              {list.map((c, i) => (
                // keyed on the filter too, so switching category re-runs the
                // entrance instead of cross-fading one cert into another
                <CertCard
                  key={`${cat}:${c.file}`}
                  cert={c}
                  index={i}
                  still={still}
                  onOpen={setActive}
                />
              ))}
            </div>
          </div>
        )}

        <div className="mx-auto mt-8 max-w-md">
          <div className="ascii-rule opacity-40" />
          <p className="mt-3 text-center font-mono text-[11px] text-white/30">
            {list.length} of {certStats.total} records listed
          </p>
        </div>
      </div>

      <CertLightbox cert={active} onClose={() => setActive(null)} />
    </main>
  )
}
