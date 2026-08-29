'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useInView } from 'framer-motion'
import GlassSection from '@/components/ui/GlassSection'
import CertWall from '@/components/effects/CertWall'
import { certificates, assets, type Certificate } from '@/data/portfolio'

const src = (file: string) => assets.certDir + encodeURIComponent(file)
const thumb = (file: string) => assets.certDir + 'thumbs/' + encodeURIComponent(file)

/**
 * CERTIFICATES — "the vault".
 *
 * These are physical documents: paper, signatures, stamps, and on the NRCT
 * award an actual embossed gold foil seal. The section leans on that rather
 * than inventing trophy graphics — the two golds sit in a vitrine as lit
 * paper on a dark plane, wearing a foil seal that echoes the real one.
 *
 * Everything else stays quiet so the vitrine is the one loud thing: a
 * monospace stat rail (these are records, so they read as data), calm
 * category pills, and a masonry grid that dims its neighbours when you
 * single one out. Motion is suppressed under prefers-reduced-motion.
 */

/** First matching rule wins; every cert lands in exactly one category. */
function categorize(c: Certificate): string {
  const s = `${c.title} ${c.issuer} ${c.file}`
  if (/makex|robot/i.test(s)) return 'robotics'
  if (/EC[_-]?Council|NDE|EHE|CTF|cyber|NCSA|RTARF|pentest|IT CLASH/i.test(s)) return 'security'
  if (/\bAI\b|BOTNOI|python|\bdata\b|typhoon|CiRA|prompt|digital twin|semiconductor/i.test(s))
    return 'ai-data'
  if (/\bENG\b|english|INTER/i.test(s)) return 'language'
  return 'misc'
}

const CATS: { key: string; label: string; chip: string; dot: string }[] = [
  { key: 'featured', label: 'Featured', chip: 'bg-amber-100 text-amber-800', dot: 'bg-amber-500' },
  { key: 'robotics', label: 'Robotics', chip: 'bg-orange-100 text-orange-800', dot: 'bg-orange-500' },
  { key: 'security', label: 'Security', chip: 'bg-emerald-100 text-emerald-800', dot: 'bg-emerald-500' },
  { key: 'ai-data', label: 'AI & Data', chip: 'bg-violet-100 text-violet-800', dot: 'bg-violet-500' },
  { key: 'language', label: 'Language', chip: 'bg-sky-100 text-sky-800', dot: 'bg-sky-500' },
  { key: 'misc', label: 'More', chip: 'bg-neutral-200 text-neutral-700', dot: 'bg-neutral-400' },
]

/** Short tag for the level, shown on cards where the level carries weight. */
const LEVEL_TAG: Record<string, string> = {
  International: 'INTL',
  National: 'NATL',
  Provincial: 'PROV',
  Institution: 'INST',
  School: 'SCH',
  Online: 'ONL',
}

/** Counts up to `to` once the rail scrolls into view. Static if motion is off. */
function Tally({ to, still }: { to: number; still: boolean }) {
  const ref = useRef<HTMLSpanElement>(null)
  const seen = useInView(ref, { once: true, margin: '-40px' })
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

/** The embossed foil seal, echoing the physical one on the NRCT certificate. */
function FoilSeal({ still }: { still: boolean }) {
  return (
    <span
      aria-hidden
      className="relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full
                 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.55)]"
      style={{
        background:
          'radial-gradient(circle at 32% 28%, #F7E7A6 0%, #D9B441 38%, #A9821A 72%, #7A5D11 100%)',
      }}
    >
      <span className="font-pixel text-[6px] leading-none text-amber-950/80">GOLD</span>
      {!still && (
        <span className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 animate-foil bg-white/45 blur-[2px]" />
      )}
    </span>
  )
}

export default function Certificates() {
  const [cat, setCat] = useState('featured')
  const [active, setActive] = useState<Certificate | null>(null)
  const [hover, setHover] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [still, setStill] = useState(false)

  useEffect(() => setMounted(true), [])

  // Honour the OS motion preference for the count-up, sheen and dimming.
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setStill(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  const byCat = useMemo(() => {
    const m = new Map<string, Certificate[]>()
    m.set('featured', certificates.filter((c) => c.featured))
    certificates.forEach((c) => {
      const k = categorize(c)
      m.set(k, [...(m.get(k) ?? []), c])
    })
    return m
  }, [])

  const golds = useMemo(() => certificates.filter((c) => c.medal === 'gold'), [])
  const stats = useMemo(
    () => ({
      total: certificates.length,
      gold: golds.length,
      national: certificates.filter((c) => c.level === 'National').length,
      intl: certificates.filter((c) => c.level === 'International').length,
    }),
    [golds],
  )

  const items = byCat.get(cat) ?? []
  const catMeta = (k: string) => CATS.find((c) => c.key === k) ?? CATS[CATS.length - 1]

  useEffect(() => {
    if (!active) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setActive(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active])

  /* ---------------------------------------------------------------- record */
  const record = (c: Certificate) => {
    const rows: [string, string][] = []
    if (c.issuer) rows.push(['ISSUER', c.issuer])
    if (c.level) rows.push(['LEVEL', c.level])
    if (c.date) rows.push(['DATE', c.date])
    if (c.result) rows.push(['RESULT', c.result])
    if (c.credential) rows.push(['CREDENTIAL', c.credential])
    return rows
  }

  const lightbox = (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setActive(null)}
          className="fixed inset-0 z-[95] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.95, y: 12, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.97, opacity: 0 }}
            transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={active.title}
            className="relative grid w-full max-w-6xl overflow-hidden rounded-3xl bg-neutral-950 shadow-2xl lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]"
          >
            {/* the document */}
            <div className="flex max-h-[52vh] items-center justify-center bg-neutral-100 p-3 sm:p-5 lg:max-h-[82vh]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src(active.file)}
                alt={active.title}
                className="max-h-[46vh] w-auto max-w-full object-contain drop-shadow-xl lg:max-h-[74vh]"
              />
            </div>

            {/* the record */}
            <div className="flex max-h-[38vh] flex-col overflow-y-auto p-5 sm:p-6 lg:max-h-[82vh]">
              <div className="flex items-start justify-between gap-3">
                <span
                  className={`inline-block rounded-full px-2.5 py-0.5 font-sans text-[11px] font-semibold ${catMeta(categorize(active)).chip}`}
                >
                  {catMeta(categorize(active)).label}
                </span>
                {active.medal === 'gold' && <FoilSeal still={still} />}
              </div>

              <h3 className="mt-3 font-sans text-xl font-semibold leading-snug text-white">
                {active.title}
              </h3>

              <dl className="mt-4 space-y-1.5 border-t border-white/10 pt-4 font-mono text-[12px]">
                {record(active).map(([k, v]) => (
                  <div key={k} className="flex gap-3">
                    <dt className="w-24 shrink-0 uppercase tracking-wider text-white/35">{k}</dt>
                    <dd className="min-w-0 text-white/80">{v}</dd>
                  </div>
                ))}
              </dl>

              {active.detail && (
                <p className="mt-4 border-t border-white/10 pt-4 font-sans text-sm leading-relaxed text-white/65">
                  {active.detail}
                </p>
              )}

              <button
                onClick={() => setActive(null)}
                className="mt-auto self-start rounded-full bg-white px-4 py-2 font-sans text-sm font-medium text-neutral-900 transition-colors hover:bg-white/85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  return (
    <GlassSection
      id="certificates"
      index="02"
      title="Certificates"
      variant="flip"
      background={<CertWall />}
      fullScreen
      panel={false}
    >
      {/* stat rail — these are records, so they read as data */}
      <div className="mb-5 flex flex-wrap items-center gap-x-5 gap-y-1 border-y border-white/12 py-2.5 font-mono text-[11px] uppercase tracking-[0.18em] text-white/40">
        <span>
          <Tally to={stats.total} still={still} /> records
        </span>
        <span className="text-amber-300/70">
          <Tally to={stats.gold} still={still} /> gold
        </span>
        <span>
          <Tally to={stats.national} still={still} /> national
        </span>
        <span>
          <Tally to={stats.intl} still={still} /> international
        </span>
      </div>

      {/* the vitrine — the two golds, as lit paper */}
      {golds.length > 0 && (
        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          {golds.map((c) => (
            <button
              key={c.file}
              onClick={() => setActive(c)}
              className="group relative overflow-hidden rounded-2xl border border-amber-200/25 bg-gradient-to-b from-amber-100/[0.07] to-transparent p-3 text-left transition-colors hover:border-amber-200/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200/70"
            >
              <div className="flex items-start gap-3">
                <div className="relative w-24 shrink-0 overflow-hidden rounded-md bg-white shadow-[0_10px_28px_-10px_rgba(0,0,0,0.9)] sm:w-28">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={thumb(c.file)} alt="" loading="lazy" className="block h-auto w-full" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-pixel text-[8px] leading-none text-amber-200/90">
                      GOLD MEDAL
                    </span>
                    <FoilSeal still={still} />
                  </div>
                  <h3 className="mt-2 line-clamp-2 font-sans text-sm font-semibold leading-snug text-white">
                    {c.title}
                  </h3>
                  <p className="mt-1 truncate font-mono text-[10px] uppercase tracking-wider text-white/45">
                    {c.issuer}
                  </p>
                  <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-amber-200/60">
                    {c.level} · {c.date}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* category pills */}
      <div className="mb-5 flex flex-wrap gap-2">
        {CATS.map((c) => {
          const on = c.key === cat
          const count = (byCat.get(c.key) ?? []).length
          return (
            <button
              key={c.key}
              onClick={() => setCat(c.key)}
              aria-pressed={on}
              className={`relative rounded-full px-4 py-2 font-sans text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70 ${
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

      {/* masonry — cards keep the scan's natural shape, never cropped */}
      <div
        key={cat}
        onMouseLeave={() => setHover(null)}
        className="max-h-[40vh] columns-1 gap-5 overflow-y-auto pb-2 pr-1 sm:columns-2 lg:columns-3 [scrollbar-width:thin]"
      >
        {items.map((c, i) => (
          <motion.button
            key={c.file}
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: Math.min(i * 0.035, 0.35), ease: [0.16, 1, 0.3, 1] }}
            whileHover={still ? undefined : { y: -6 }}
            onMouseEnter={() => setHover(c.file)}
            onFocus={() => setHover(c.file)}
            onBlur={() => setHover(null)}
            onClick={() => setActive(c)}
            style={{ opacity: still || !hover || hover === c.file ? 1 : 0.5 }}
            className="group mb-5 w-full break-inside-avoid overflow-hidden rounded-2xl bg-white text-left shadow-[0_12px_40px_-14px_rgba(0,0,0,0.7)] transition-[box-shadow,opacity] duration-200 hover:shadow-[0_28px_70px_-16px_rgba(0,0,0,0.85)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={thumb(c.file)}
                alt={c.title}
                loading="lazy"
                draggable={false}
                className="block h-auto w-full"
              />
              {c.medal === 'gold' && (
                <span className="absolute right-3 top-3 rounded-full bg-amber-400 px-2 py-0.5 font-sans text-[10px] font-bold text-amber-950 shadow">
                  GOLD
                </span>
              )}
              {c.level && !c.medal && (c.level === 'National' || c.level === 'International') && (
                <span className="absolute right-3 top-3 rounded bg-neutral-900/85 px-1.5 py-0.5 font-mono text-[9px] font-semibold tracking-wider text-white">
                  {LEVEL_TAG[c.level]}
                </span>
              )}
            </div>
            <div className="border-t border-neutral-100 p-4">
              <span
                className={`inline-block rounded-full px-2.5 py-0.5 font-sans text-[11px] font-semibold ${catMeta(categorize(c)).chip}`}
              >
                {catMeta(categorize(c)).label}
              </span>
              <h3 className="mt-2 line-clamp-2 font-sans text-base font-semibold leading-snug text-neutral-900">
                {c.title}
              </h3>
              {c.issuer && (
                <p className="mt-1 truncate font-sans text-xs text-neutral-500">{c.issuer}</p>
              )}
              {(c.result || c.date) && (
                <p className="mt-2 truncate font-mono text-[10px] uppercase tracking-wider text-neutral-400">
                  {[c.result, c.date].filter(Boolean).join(' · ')}
                </p>
              )}
            </div>
          </motion.button>
        ))}
      </div>

      {mounted && createPortal(lightbox, document.body)}
    </GlassSection>
  )
}
