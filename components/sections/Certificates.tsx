'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useInView } from 'framer-motion'
import GlassSection from '@/components/ui/GlassSection'
import CertWall from '@/components/effects/CertWall'
import { certificates, assets, type Certificate } from '@/data/portfolio'

const src = (file: string) => assets.certDir + encodeURIComponent(file)
const thumb = (file: string) => assets.certDir + 'thumbs/' + encodeURIComponent(file)

/**
 * CERTIFICATES — a wall you can walk up to.
 *
 * The documents hang on an evenly spaced grid in perspective: same cell size,
 * same gutter, rows and columns true. Drag to move along it, scroll or use the
 * slider to zoom, hover to bring one forward. Past 1.8x the visible cards swap
 * their 520px thumbnail for the full scan, so zooming in actually resolves the
 * text instead of magnifying blur.
 *
 * The two golds stay in their vitrine above the wall, and the record panel is
 * unchanged — this replaces the masonry underneath, nothing else.
 */

const COLS = 8
const CELL = 148 // px, before zoom
const GAP = 14
const ZOOM_MIN = 0.55
const ZOOM_MAX = 3
const FULLRES_AT = 1.8

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

const LEVEL_TAG: Record<string, string> = {
  International: 'INTL',
  National: 'NATL',
  Provincial: 'PROV',
  Institution: 'INST',
  School: 'SCH',
  Online: 'ONL',
}

function Tally({ to, still }: { to: number; still: boolean }) {
  const ref = useRef<HTMLSpanElement>(null)
  // vertical margin only: '-40px' on all sides also eats 40px off the left,
  // and this span is only as wide as its digits — the first tally sat inside
  // that dead zone and never fired.
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

/** The embossed foil seal, echoing the physical one on the NRCT certificate. */
function FoilSeal({ still }: { still: boolean }) {
  return (
    <span
      aria-hidden
      className="relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full shadow-[0_2px_10px_-2px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.55)]"
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

  // wall camera
  const [zoom, setZoom] = useState(0.8)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const viewportRef = useRef<HTMLDivElement | null>(null)
  const wheelOff = useRef<(() => void) | null>(null)
  const drag = useRef({ on: false, x: 0, y: 0, px: 0, py: 0, moved: false })

  useEffect(() => setMounted(true), [])

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

  // recentre whenever the wall's contents change
  useEffect(() => {
    setPan({ x: 0, y: 0 })
  }, [cat])

  // Wheel zoom. This has to be a callback ref rather than a mount effect:
  // GlassSection mounts its children late, so on first render viewportRef was
  // still null and the listener never attached — the wheel fell through to the
  // page and scrolled to the next section instead of zooming.
  // stopPropagation as well as preventDefault, so nothing above us reacts either.
  const attachViewport = useCallback((el: HTMLDivElement | null) => {
    wheelOff.current?.()
    wheelOff.current = null
    viewportRef.current = el
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setZoom((z) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z * (e.deltaY > 0 ? 0.9 : 1.1))))
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    wheelOff.current = () => el.removeEventListener('wheel', onWheel)
  }, [])

  useEffect(() => {
    if (!active) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setActive(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active])

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    drag.current = { on: true, x: e.clientX, y: e.clientY, px: 0, py: 0, moved: false }
    setPan((p) => {
      drag.current.px = p.x
      drag.current.py = p.y
      return p
    })
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }, [])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const d = drag.current
    if (!d.on) return
    const dx = e.clientX - d.x
    const dy = e.clientY - d.y
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) d.moved = true
    setPan({ x: d.px + dx, y: d.py + dy })
  }, [])

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    drag.current.on = false
    try {
      ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
    } catch {}
  }, [])

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

  const wallW = COLS * CELL + (COLS - 1) * GAP
  const fullRes = zoom >= FULLRES_AT

  return (
    <GlassSection
      id="certificates"
      index="02"
      title="Certificates"
      variant="flip"
      background={
        // the conveyor and the wall are both walls of the same certificates;
        // hold it back so it reads as texture, not a second gallery
        <div className="pointer-events-none absolute inset-0 opacity-25">
          <CertWall />
        </div>
      }
      fullScreen
      panel={false}
    >
      {/* stat rail */}
      <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-1 border-y border-white/12 py-2.5 font-mono text-[11px] uppercase tracking-[0.18em] text-white/40">
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

      {/* vitrine — the two golds */}
      {golds.length > 0 && (
        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          {golds.map((c) => (
            <button
              key={c.file}
              onClick={() => setActive(c)}
              className="group relative overflow-hidden rounded-2xl border border-amber-200/25 bg-gradient-to-b from-amber-100/[0.07] to-transparent p-2.5 text-left transition-colors hover:border-amber-200/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200/70"
            >
              <div className="flex items-start gap-3">
                <div className="w-20 shrink-0 overflow-hidden rounded-md bg-white shadow-[0_10px_28px_-10px_rgba(0,0,0,0.9)] sm:w-24">
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
                  <h3 className="mt-1.5 line-clamp-2 font-sans text-sm font-semibold leading-snug text-white">
                    {c.title}
                  </h3>
                  <p className="mt-1 truncate font-mono text-[10px] uppercase tracking-wider text-amber-200/60">
                    {c.issuer} · {c.date}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* filters */}
      <div className="mb-3 flex flex-wrap gap-2">
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

      {/* ── the wall ───────────────────────────────────────────────────── */}
      <div
        ref={attachViewport}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onMouseLeave={() => setHover(null)}
        className="relative h-[42vh] cursor-grab touch-none select-none overflow-hidden rounded-2xl border border-white/10 bg-black/25 active:cursor-grabbing"
        style={{ perspective: '1400px' }}
      >
        <div
          className="absolute left-1/2 top-1/2"
          style={{
            width: wallW,
            transform: `translate(-50%,-50%) translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom}) rotateX(${still ? 0 : 7}deg)`,
            transformStyle: 'preserve-3d',
            transition: drag.current.on ? 'none' : 'transform 220ms cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          <div
            className="grid"
            style={{ gridTemplateColumns: `repeat(${COLS}, ${CELL}px)`, gap: GAP }}
          >
            {items.map((c) => {
              const lifted = hover === c.file
              return (
                <button
                  key={c.file}
                  onMouseEnter={() => setHover(c.file)}
                  onFocus={() => setHover(c.file)}
                  onBlur={() => setHover(null)}
                  onClick={() => {
                    if (!drag.current.moved) setActive(c)
                  }}
                  title={`${c.title}${c.issuer ? ' — ' + c.issuer : ''}`}
                  className="group relative block overflow-hidden rounded-lg bg-white text-left shadow-[0_10px_28px_-12px_rgba(0,0,0,0.85)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  style={{
                    aspectRatio: '4 / 3',
                    transform: lifted && !still ? 'translateZ(70px)' : 'translateZ(0)',
                    transition: still ? 'none' : 'transform 220ms cubic-bezier(0.16,1,0.3,1), opacity 180ms',
                    opacity: still || !hover || lifted ? 1 : 0.45,
                    zIndex: lifted ? 5 : 1,
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={fullRes ? src(c.file) : thumb(c.file)}
                    alt={c.title}
                    loading="lazy"
                    draggable={false}
                    className="h-full w-full bg-white object-contain"
                  />
                  {c.medal === 'gold' && (
                    <span className="absolute right-1.5 top-1.5 rounded-full bg-amber-400 px-1.5 py-px font-sans text-[9px] font-bold text-amber-950 shadow">
                      GOLD
                    </span>
                  )}
                  {c.level && !c.medal && (c.level === 'National' || c.level === 'International') && (
                    <span className="absolute right-1.5 top-1.5 rounded bg-neutral-900/85 px-1 py-px font-mono text-[8px] font-semibold tracking-wider text-white">
                      {LEVEL_TAG[c.level]}
                    </span>
                  )}
                  {/* label only once the wall is close enough to read it */}
                  {zoom >= 1.15 && (
                    <span className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/85 to-transparent px-1.5 pb-1 pt-4 font-sans text-[9px] font-medium text-white">
                      {c.title}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* controls */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-gradient-to-t from-black/70 to-transparent px-3 pb-2.5 pt-8">
          <span className="font-mono text-[10px] uppercase tracking-wider text-white/45">
            drag to move · scroll to zoom · click to open
          </span>
          <div className="pointer-events-auto flex items-center gap-2">
            <span className="font-mono text-[10px] tabular-nums text-white/45">
              {zoom.toFixed(1)}×
            </span>
            <input
              type="range"
              min={ZOOM_MIN}
              max={ZOOM_MAX}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              aria-label="Zoom the certificate wall"
              className="h-1 w-28 cursor-pointer appearance-none rounded-full bg-white/25 accent-white"
            />
            <button
              onClick={() => {
                setZoom(0.8)
                setPan({ x: 0, y: 0 })
              }}
              className="rounded-full border border-white/20 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-white/60 transition-colors hover:border-white/40 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70"
            >
              reset
            </button>
          </div>
        </div>
      </div>

      {mounted && createPortal(lightbox, document.body)}
    </GlassSection>
  )
}
