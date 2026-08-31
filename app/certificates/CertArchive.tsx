'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import CertCard from '@/components/ui/CertCard'
import CertLightbox from '@/components/ui/CertLightbox'
import ThemeToggle from '@/components/ThemeToggle'
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
            <span className="text-fg/70">{handle}</span>
            <span className="text-fg/25">@exe</span>
            <span className="text-fg-dim">:~$</span>
          </span>
          <span className="select-none text-fg-muted">cd</span>
          <span className="caret text-fg">certificates/</span>
          <Link
            href="/#certificates"
            className="ml-auto inline-flex min-h-[32px] shrink-0 items-center text-fg-dim transition-colors hover:text-fg"
          >
            &#8592; back
          </Link>
          <span className="hidden shrink-0 select-none tabular-nums tracking-widest text-fg/25 sm:inline">
            {time || '--:--:--'}
          </span>
          <ThemeToggle />
        </div>

        <h1 className="mt-3 font-crt text-6xl leading-[0.85] tracking-[0.06em] text-fg txt-glow sm:text-7xl lg:text-8xl">
          CERTIFICATES
        </h1>
        <p className="mt-2 font-mono text-[11px] text-fg-dim sm:text-xs">
          {certStats.total} records · {certStats.gold} gold · {certStats.national} national ·{' '}
          {certStats.intl} international · {certSpan}
        </p>
      </div>

      {/* ---------- search + categories, and that is the whole control set ------ */}
      {/* Sticky only once the pills fit on one line. Wrapped to three rows on a
          phone this bar held 20% of the viewport hostage; there it scrolls away
          and you get the screen back. */}
      <div className="z-30 mt-5 border-y border-fg/10 bg-bg/85 backdrop-blur-xl lg:sticky lg:top-0">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex min-w-0 flex-1 basis-56 items-center gap-2 rounded-full border border-fg/15 bg-fg/[0.04] px-4 py-2 transition-colors focus-within:border-fg/45 sm:max-w-xs">
              <span aria-hidden className="shrink-0 text-fg-dim">
                &#9906;
              </span>
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search certificates"
                aria-label="Search certificates"
                className="min-w-0 flex-1 bg-transparent font-sans text-sm text-fg caret-fg outline-none placeholder:text-fg-dim"
              />
              {query && (
                <button
                  onClick={() => {
                    setQuery('')
                    searchRef.current?.focus()
                  }}
                  aria-label="Clear search"
                  className="shrink-0 text-fg-dim transition-colors hover:text-fg"
                >
                  &#10005;
                </button>
              )}
            </label>

            <span className="shrink-0 font-mono text-[11px] text-fg-dim">
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
                  className={`relative rounded-full px-4 py-1.5 font-sans text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg/70 ${
                    on ? 'text-bg' : 'text-fg/70 hover:text-fg'
                  }`}
                >
                  {on && (
                    <motion.span
                      layoutId="cert-pill-archive"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                      className="absolute inset-0 rounded-full bg-fg shadow-lg"
                    />
                  )}
                  <span className="relative flex items-center gap-2">
                    <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
                    {c.label}
                    <span className={on ? 'text-bg/60' : 'text-fg-dim'}>
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
            <p className="font-sans text-fg/70">No certificates match &ldquo;{query}&rdquo;</p>
            <button
              onClick={() => {
                setQuery('')
                setCat('all')
              }}
              className="mt-4 rounded-full border border-fg/25 px-4 py-1.5 font-sans text-sm text-fg/80 transition-colors hover:border-fg/60 hover:text-fg"
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
          <p className="mt-3 text-center font-mono text-[11px] text-fg-dim">
            {list.length} of {certStats.total} records listed
          </p>
        </div>
      </div>

      <CertLightbox cert={active} onClose={() => setActive(null)} />
    </main>
  )
}
