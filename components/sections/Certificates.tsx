'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import GlassSection from '@/components/ui/GlassSection'
import CertWall from '@/components/effects/CertWall'
import CertCard from '@/components/ui/CertCard'
import CertLightbox from '@/components/ui/CertLightbox'
import { certThumb, CATS, groupByCategory, certStats } from '@/lib/certs'
import { certificates, type Certificate } from '@/data/portfolio'

/**
 * CERTIFICATES - three tiers, because 56 documents are not 56 equal things.
 *
 *   1. PODIUM   the four results that carry a rank
 *   2. ROUTE    MakeX was one six-month campaign, not seven loose certificates
 *   3. PREVIEW  three rows of the archive, with the rest on /certificates
 */

const PREVIEW_ROWS = 3
const COLS_AT_WIDEST = 4
const PREVIEW_COUNT = PREVIEW_ROWS * COLS_AT_WIDEST

const MAKEX_ROUTE = [
  'MakeX Warmup.jpg',
  'MakeX tournament 1.jpg',
  'MakeX tournament 2.jpg',
  'MakeX tournament 3.jpg',
  'MakeX tournament 4.jpg',
  'MakeX Qualification.jpg',
  'MakeX Ultimate winner.jpg',
]

const ROUTE_LABEL: Record<string, { when: string; what: string }> = {
  'MakeX Warmup.jpg': { when: 'Jun', what: 'Warm Up' },
  'MakeX tournament 1.jpg': { when: 'Jun', what: 'Tour 1' },
  'MakeX tournament 2.jpg': { when: 'Jul', what: 'Tour 2' },
  'MakeX tournament 3.jpg': { when: 'Aug', what: 'Tour 3' },
  'MakeX tournament 4.jpg': { when: 'Sep', what: 'Tour 4' },
  'MakeX Qualification.jpg': { when: 'Oct', what: 'Qualifier' },
  'MakeX Ultimate winner.jpg': { when: 'Nov', what: 'Nationals' },
}

const MEDAL_FACE: Record<string, { ring: string; text: string; fill: string }> = {
  gold: {
    ring: 'border-amber-200/40',
    text: 'text-amber-200',
    fill: 'radial-gradient(circle at 32% 28%, #F7E7A6 0%, #D9B441 38%, #A9821A 72%, #7A5D11 100%)',
  },
  bronze: {
    ring: 'border-orange-300/35',
    text: 'text-orange-200',
    fill: 'radial-gradient(circle at 32% 28%, #F0C9A0 0%, #C98A4F 38%, #9A5F2C 72%, #6E4220 100%)',
  },
}

function Tally({ to, still }: { to: number; still: boolean }) {
  const ref = useRef<HTMLSpanElement>(null)
  // Vertical margin only: '-40px' on every side also eats 40px off the left,
  // and this span is only as wide as its digits.
  const seen = useInView(ref, { once: true, margin: '-40px 0px' })
  const [n, setN] = useState(still ? to : 0)
  useEffect(() => {
    if (still || !seen) return
    let raf = 0
    const t0 = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - t0) / 900, 1)
      setN(Math.round((1 - Math.pow(1 - p, 3)) * to))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [seen, to, still])
  return (
    <span ref={ref} className="tabular-nums text-white">
      {n}
    </span>
  )
}

/** Echoes the embossed foil seal physically present on the NRCT certificate. */
function Seal({ medal, still, size = 44 }: { medal: string; still: boolean; size?: number }) {
  const face = MEDAL_FACE[medal] ?? MEDAL_FACE.gold
  return (
    <span
      aria-hidden
      style={{ width: size, height: size, background: face.fill }}
      className="relative grid shrink-0 place-items-center overflow-hidden rounded-full shadow-[0_2px_10px_-2px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.5)]"
    >
      <span className="font-pixel text-[6px] leading-none text-black/55">
        {medal === 'gold' ? 'GOLD' : '3RD'}
      </span>
      {!still && (
        <span className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 animate-foil bg-white/45 blur-[2px]" />
      )}
    </span>
  )
}

export default function Certificates() {
  const [cat, setCat] = useState('all')
  // the grid is 1/2/3/4 columns by breakpoint, so a row index computed from a
  // fixed 4 would fade the wrong cards on anything narrower
  const [cols, setCols] = useState(4)
  const [active, setActive] = useState<Certificate | null>(null)
  const [still, setStill] = useState(false)

  useEffect(() => {
    const measure = () => {
      const w = window.innerWidth
      setCols(w >= 1280 ? 4 : w >= 1024 ? 3 : w >= 640 ? 2 : 1)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setStill(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  const byFile = useMemo(() => new Map(certificates.map((c) => [c.file, c])), [])
  const byCat = useMemo(groupByCategory, [])

  const podium = useMemo(
    () =>
      certificates
        .filter((c) => c.medal)
        .sort((a, b) => (b.medal === 'gold' ? 1 : 0) - (a.medal === 'gold' ? 1 : 0)),
    [],
  )
  const route = useMemo(
    () => MAKEX_ROUTE.map((f) => byFile.get(f)).filter(Boolean) as Certificate[],
    [byFile],
  )

  const all = byCat.get(cat) ?? []
  const shown = all.slice(0, PREVIEW_COUNT)
  const remaining = all.length - shown.length

  return (
    <GlassSection
      id="certificates"
      index="02"
      title="Certificates"
      // "rise" only offsets y by a fixed 44px. flip/zoom/blur displace by a
      // share of the element, which throws a tall section off its own
      // viewport observer and leaves it hidden forever.
      variant="rise"
      background={
        <div className="pointer-events-none absolute inset-0 opacity-25">
          <CertWall />
        </div>
      }
      panel={false}
      revealAmount="some"
    >
      {/* stat rail */}
      <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-1 border-y border-white/12 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-white/40">
        <span>
          <Tally to={certStats.total} still={still} /> records
        </span>
        <span className="text-amber-300/70">
          <Tally to={certStats.gold} still={still} /> gold
        </span>
        <span>
          <Tally to={certStats.national} still={still} /> national
        </span>
        <span>
          <Tally to={certStats.intl} still={still} /> international
        </span>
      </div>

      {/* 1. PODIUM */}
      <div className="mb-5 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
        {podium.map((c) => {
          const face = MEDAL_FACE[c.medal ?? 'gold']
          return (
            <button
              key={c.file}
              onClick={() => setActive(c)}
              className={`group flex items-start gap-3 rounded-2xl border ${face.ring} bg-gradient-to-b from-white/[0.06] to-transparent p-2.5 text-left transition-colors hover:from-white/[0.11] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70`}
            >
              <div className="w-16 shrink-0 overflow-hidden rounded-md bg-white shadow-[0_8px_22px_-10px_rgba(0,0,0,0.9)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={certThumb(c.file)} alt="" loading="lazy" className="block h-auto w-full" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <span className={`font-pixel text-[7px] leading-none ${face.text}`}>
                    {c.medal === 'gold' ? 'GOLD MEDAL' : '3RD PLACE'}
                  </span>
                  <Seal medal={c.medal ?? 'gold'} still={still} size={34} />
                </div>
                <h3 className="mt-1.5 line-clamp-2 font-sans text-[13px] font-semibold leading-snug text-white">
                  {c.title}
                </h3>
                <p className="mt-1 truncate font-mono text-[9px] uppercase tracking-wider text-white/45">
                  {c.issuer}
                </p>
              </div>
            </button>
          )
        })}
      </div>

      {/* 2. THE MAKEX ROUTE */}
      {route.length > 0 && (
        <div className="mb-5 rounded-2xl border border-white/10 bg-black/25 p-3 sm:p-4">
          <div className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h3 className="font-sans text-sm font-semibold text-white">
              MakeX Challenge - six months, one robot
            </h3>
            <span className="font-mono text-[10px] uppercase tracking-wider text-white/40">
              Team Prometheus · Jun to Nov 2025
            </span>
          </div>
          <ol className="flex gap-0 overflow-x-auto pb-1 [scrollbar-width:thin]">
            {route.map((c, i) => {
              const meta = ROUTE_LABEL[c.file] ?? { when: '', what: c.title }
              const last = i === route.length - 1
              return (
                <li
                  key={c.file}
                  className="flex min-w-[92px] flex-1 flex-col items-center sm:min-w-[104px]"
                >
                  <div className="relative flex h-7 w-full items-center">
                    <span
                      className={`absolute left-0 h-px w-1/2 ${i === 0 ? 'bg-transparent' : 'bg-white/20'}`}
                    />
                    <span
                      className={`absolute right-0 h-px w-1/2 ${last ? 'bg-transparent' : 'bg-white/20'}`}
                    />
                    <button
                      onClick={() => setActive(c)}
                      aria-label={`${meta.what} - ${c.title}`}
                      className="relative mx-auto rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70"
                    >
                      {last ? (
                        <Seal medal="bronze" still={still} size={26} />
                      ) : (
                        <span className="block h-2.5 w-2.5 rounded-full border border-white/40 bg-neutral-900 transition-colors hover:border-white hover:bg-white" />
                      )}
                    </button>
                  </div>
                  <button
                    onClick={() => setActive(c)}
                    className="group mt-1.5 w-full px-1 text-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70"
                  >
                    <span className="block font-mono text-[9px] uppercase tracking-wider text-white/35">
                      {meta.when}
                    </span>
                    <span
                      className={`mt-0.5 block font-sans text-[11px] font-medium leading-tight transition-colors group-hover:text-white ${last ? 'text-orange-200' : 'text-white/70'}`}
                    >
                      {meta.what}
                    </span>
                    {last && (
                      <span className="mt-0.5 block font-mono text-[8px] uppercase leading-tight tracking-wider text-orange-200/70">
                        3rd + Best Alliance
                      </span>
                    )}
                  </button>
                </li>
              )
            })}
          </ol>
        </div>
      )}

      {/* 3. PREVIEW - three rows, the rest on its own page */}
      <div className="mb-4 flex flex-wrap gap-2">
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
                  layoutId="cert-pill"
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
        {shown.map((c, i) => {
          // 100% / 50% / 25% down the rows: the grid recedes rather than
          // stopping dead, which points at the Explore link below it.
          // Hovering lifts a card back to full so nothing is unreadable.
          const row = Math.floor(i / cols)
          const fade = [1, 0.5, 0.25][row] ?? 0.25
          const soften = [0, 1.5, 3][row] ?? 3
          return (
            <div
              key={c.file}
              style={{ opacity: fade, filter: soften ? `blur(${soften}px)` : undefined }}
              className="group/fade transition-[opacity,filter] duration-300 hover:!opacity-100 hover:!blur-none focus-within:!opacity-100 focus-within:!blur-none"
            >
              <CertCard cert={c} index={i} still={still} onOpen={setActive} />
            </div>
          )
        })}
      </div>

      {remaining > 0 && (
        <div className="mt-6 flex justify-center">
          <Link
            href="/certificates"
            className="group inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-2.5 font-sans text-sm font-medium text-white/80 transition-colors hover:border-white/60 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Explore all {certStats.total} certificates
            <span className="font-mono text-white/45 transition-colors group-hover:text-white/80">
              +{remaining} more
            </span>
            <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </Link>
        </div>
      )}

      <CertLightbox cert={active} onClose={() => setActive(null)} />
    </GlassSection>
  )
}
