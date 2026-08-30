'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import CertCard from '@/components/ui/CertCard'
import CertLightbox from '@/components/ui/CertLightbox'
import { CATS, groupByCategory, certStats } from '@/lib/certs'
import { player, type Certificate } from '@/data/portfolio'

/**
 * The full archive: every certificate, as a plain scrolling grid.
 *
 * Dressed as the rest of the site rather than as a separate page. It paints no
 * background of its own, so the body's vignette and 44px grid run underneath it
 * exactly as they do on the one-pager; the bar at the top is the same command
 * prompt as the nav; the filter is the same white pill the home section uses,
 * down to the shared spring; and the grid sits in a .glass-panel, which is the
 * shell every section on the front page lives in.
 *
 * Deliberately quiet after the endless board: nothing moves but the scroll.
 */
export default function CertArchive() {
  const [cat, setCat] = useState('all')
  const [active, setActive] = useState<Certificate | null>(null)
  const [still, setStill] = useState(false)
  const [time, setTime] = useState('')

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
  const list = byCat.get(cat) ?? []
  const handle = player.handle.toLowerCase().replace('.exe', '')

  return (
    <main className="min-h-screen pb-24">
      {/* Sticky so the filter stays reachable down a long grid. Translucent
          black, not a solid fill: the page backdrop has to keep showing. */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-black/80 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
          {/* the prompt, verbatim from the nav */}
          <div className="flex items-center gap-2 font-mono text-[12px]">
            <span className="shrink-0 select-none">
              <span className="text-white/70">{handle}</span>
              <span className="text-white/25">@exe</span>
              <span className="text-white/40">:~$</span>
            </span>
            <span className="select-none text-white/55">cd</span>
            <span className="caret text-white">certificates/</span>
            <span className="ml-auto hidden shrink-0 select-none tabular-nums tracking-widest text-white/35 sm:inline">
              {time || '--:--:--'}
            </span>
          </div>

          {/* index + title + underline: the section header from the one-pager */}
          <div className="relative mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1 pb-3">
            <span className="font-mono text-xs text-white/40">02</span>
            <h1 className="font-mono text-lg font-bold uppercase tracking-[0.2em] text-white txt-glow sm:text-xl">
              Certificates
            </h1>
            <span className="font-mono text-[11px] text-white/35">
              {certStats.total} records · {certStats.gold} gold · {certStats.national} national ·{' '}
              {certStats.intl} intl
            </span>
            <Link
              href="/#certificates"
              className="ml-auto shrink-0 font-mono text-[11px] text-white/40 transition-colors hover:text-white"
            >
              &#8592; cd ..
            </Link>
            <span className="absolute inset-x-0 bottom-0 h-px bg-white/10" />
          </div>

          {/* the same pill control as the home section, same spring */}
          <div className="mt-3 flex flex-wrap gap-2">
            {CATS.map((c) => {
              const on = c.key === cat
              const n = (byCat.get(c.key) ?? []).length
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
                    <span className={on ? 'text-neutral-400' : 'text-white/35'}>{n}</span>
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
        <div className="glass-panel rounded-2xl p-4 sm:p-6">
          <div className="grid grid-cols-2 items-stretch gap-4 lg:grid-cols-3 xl:grid-cols-4">
            {list.map((c, i) => (
              // keyed on the filter too, so switching category re-runs the
              // entrance instead of cross-fading one cert into another
              <CertCard key={`${cat}:${c.file}`} cert={c} index={i} still={still} onOpen={setActive} />
            ))}
          </div>

          {list.length === 0 && (
            <p className="py-20 text-center font-mono text-sm text-white/40">
              no records in this category
            </p>
          )}
        </div>

        {/* the terminal signs off rather than the page just stopping */}
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
