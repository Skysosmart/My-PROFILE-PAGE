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
 * CERTIFICATES - three tiers, because 56 documents are not 56 equal things.
 *
 *   1. PODIUM   the four results that carry a rank
 *   2. ROUTE    MakeX was one six-month campaign, not seven loose certificates,
 *               so it reads as the sequence it actually was
 *   3. ARCHIVE  everything else, as the masonry of big white cards
 *
 * Sequencing the route is honest here: the order IS the content - warm-up, four
 * point-race tournaments, a qualifier, then the national final.
 */

/** The MakeX campaign, in the order it happened. */
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
  { key: 'all', label: 'All', chip: 'bg-neutral-200 text-neutral-700', dot: 'bg-white' },
  { key: 'featured', label: 'Featured', chip: 'bg-amber-100 text-amber-800', dot: 'bg-amber-500' },
  { key: 'robotics', label: 'Robotics', chip: 'bg-orange-100 text-orange-800', dot: 'bg-orange-500' },
  { key: 'security', label: 'Security', chip: 'bg-emerald-100 text-emerald-800', dot: 'bg-emerald-500' },
  { key: 'ai-data', label: 'AI & Data', chip: 'bg-violet-100 text-violet-800', dot: 'bg-violet-500' },
  { key: 'language', label: 'Language', chip: 'bg-sky-100 text-sky-800', dot: 'bg-sky-500' },
  { key: 'misc', label: 'More', chip: 'bg-neutral-200 text-neutral-700', dot: 'bg-neutral-400' },
]

const LEVEL_TAG: Record<string, string> = {
  International: 'INTL',
  National: 'NATL',
  Provincial: 'PROV',
  Institution: 'INST',
  School: 'SCH',
  Online: 'ONL',
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
  // Vertical margin only. '-40px' on every side also eats 40px off the left,
  // and this span is only as wide as its digits, so the first tally sat inside
  // the dead zone and never fired.
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
  const [active, setActive] = useState<Certificate | null>(null)
  const [mounted, setMounted] = useState(false)
  const [still, setStill] = useState(false)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setStill(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  const byFile = useMemo(() => new Map(certificates.map((c) => [c.file, c])), [])

  const byCat = useMemo(() => {
    const m = new Map<string, Certificate[]>()
    m.set('all', [...certificates])
    m.set('featured', certificates.filter((c) => c.featured))
    certificates.forEach((c) => {
      const k = categorize(c)
      m.set(k, [...(m.get(k) ?? []), c])
    })
    return m
  }, [])

  // gold ahead of the thirds - rank order, not file order
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

  const stats = useMemo(
    () => ({
      total: certificates.length,
      gold: certificates.filter((c) => c.medal === 'gold').length,
      national: certificates.filter((c) => c.level === 'National').length,
      intl: certificates.filter((c) => c.level === 'International').length,
    }),
    [],
  )

  const items = byCat.get(cat) ?? []
  const catMeta = (k: string) => CATS.find((c) => c.key === k) ?? CATS[CATS.length - 1]
  // a card always wears its own category chip, never the 'all' tab's

  useEffect(() => {
    if (!active) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setActive(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active])

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
            <div className="flex max-h-[52vh] items-center justify-center bg-neutral-100 p-3 sm:p-5 lg:max-h-[82vh]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src(active.file)}
                alt={active.title}
                className="max-h-[46vh] w-auto max-w-full object-contain drop-shadow-xl lg:max-h-[74vh]"
              />
            </div>
            <div className="flex max-h-[38vh] flex-col overflow-y-auto p-5 sm:p-6 lg:max-h-[82vh]">
              <div className="flex items-start justify-between gap-3">
                <span
                  className={`inline-block rounded-full px-2.5 py-0.5 font-sans text-[11px] font-semibold ${catMeta(categorize(active)).chip}`}
                >
                  {catMeta(categorize(active)).label}
                </span>
                {active.medal && <Seal medal={active.medal} still={still} />}
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
      // "rise" only offsets y by a fixed 44px. flip/zoom/blur displace by a
      // share of the element, and this section is ~10,000px tall: its hidden
      // state threw it thousands of px off screen, so the viewport observer
      // never saw it and it stayed hidden forever.
      variant="rise"
      background={
        <div className="pointer-events-none absolute inset-0 opacity-25">
          <CertWall />
        </div>
      }
      panel={false}
      // this section grows with its content and runs far taller than the
      // viewport, so the default 20%-visible trigger could never fire
      revealAmount="some"
    >
      {/* stat rail */}
      <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-1 border-y border-white/12 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-white/40">
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

      {/* ── 1. PODIUM ──────────────────────────────────────────────────── */}
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
                <img src={thumb(c.file)} alt="" loading="lazy" className="block h-auto w-full" />
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

      {/* ── 2. THE MAKEX ROUTE ─────────────────────────────────────────── */}
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

      {/* ── 3. THE ARCHIVE ─────────────────────────────────────────────── */}
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
        className="grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        {items.map((c, i) => (
          <motion.button
            key={c.file}
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: Math.min(i * 0.035, 0.35), ease: [0.16, 1, 0.3, 1] }}
            whileHover={still ? undefined : { y: -6 }}
            onClick={() => setActive(c)}
            className="group flex h-full w-full flex-col overflow-hidden rounded-2xl bg-white text-left shadow-[0_12px_40px_-14px_rgba(0,0,0,0.7)] transition-shadow hover:shadow-[0_28px_70px_-16px_rgba(0,0,0,0.85)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            {/* fixed 4:3 well, image contained: every cell is the same size and
                no certificate gets cropped - portrait scans letterbox instead */}
            <div className="relative aspect-[4/3] w-full shrink-0 bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={thumb(c.file)}
                alt={c.title}
                loading="lazy"
                draggable={false}
                className="absolute inset-0 h-full w-full object-contain p-1.5"
              />
              {c.medal && (
                <span
                  className={`absolute right-3 top-3 rounded-full px-2 py-0.5 font-sans text-[10px] font-bold shadow ${c.medal === 'gold' ? 'bg-amber-400 text-amber-950' : 'bg-orange-300 text-orange-950'}`}
                >
                  {c.medal === 'gold' ? 'GOLD' : '3RD'}
                </span>
              )}
              {c.level && !c.medal && (c.level === 'National' || c.level === 'International') && (
                <span className="absolute right-3 top-3 rounded bg-neutral-900/85 px-1.5 py-0.5 font-mono text-[9px] font-semibold tracking-wider text-white">
                  {LEVEL_TAG[c.level]}
                </span>
              )}
            </div>
            <div className="flex flex-1 flex-col border-t border-neutral-100 p-4">
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
                <p className="mt-auto pt-2 truncate font-mono text-[10px] uppercase tracking-wider text-neutral-400">
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
