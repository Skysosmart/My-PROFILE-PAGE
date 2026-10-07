'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring } from 'motion/react'
import InkNote from '@/components/ui/InkNote'
import type { Chapter } from '@/data/portfolio'
import { fmt, ui } from '@/data/ui'

/**
 * The education timeline with a paper plane flying it.
 *
 * Every school is a stop on one ink line, oldest first, the current one last
 * (from the data: the chapter with no `to` year). Beside each stop: the
 * years, the level, CURRENT in print where the data says so. On the stop: an
 * editorial paper record - who and where, what changed, a real photo when
 * there is one.
 *
 * The plane: when the timeline first comes on screen a scrap of paper folds
 * into a plane, and from then on its position is the reader's position. The
 * route is an SVG path built from the measured stops (never fixed numbers,
 * so Thai's taller cards or a resize just rebuild it), weaving either side
 * of the line and leaning toward each record as it passes. The plane rides
 * the path by scroll, slows a touch at every stop, turns with the path
 * (within ±25°, never upside down), draws a dashed ink trail behind itself,
 * and at the current school makes one small arc, settles beside the card,
 * tilts and stays.
 *
 * Arrival at a stop lights its dot pink with a one-time pen burst, brings
 * the date to full ink and reveals the record (once; scrolling back never
 * hides it again). Reduced motion: no fold, no flight, every record and dot
 * in its final state, the whole route drawn, the plane parked at the end.
 *
 * Work is only done while the timeline is near the screen; the geometry is
 * measured on resize (ResizeObserver), not per frame.
 */
const EASE = [0.16, 1, 0.3, 1] as const
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))

type Geo = {
  d: string
  /** path length at a sampled y, for y -> length lookups */
  lut: { y: number; len: number }[]
  /** the y of each stop's dot, in the journey's own coordinates */
  stops: number[]
  startY: number
  endY: number
  total: number
  planeSize: number
}

/** Catmull-Rom through the points, as cubic beziers: a hand's smooth curve */
function smooth(pts: [number, number][]) {
  let d = `M${pts[0][0]} ${pts[0][1]}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[Math.min(pts.length - 1, i + 2)]
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]
    d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`
  }
  return d
}

export default function EducationJourney({
  chapters,
  counts,
  t,
}: {
  chapters: Chapter[]
  counts: number[]
  t: (typeof ui)['en']['education']
}) {
  const reduce = !!useReducedMotion()
  const root = useRef<HTMLDivElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const planeRef = useRef<HTMLDivElement>(null)
  const trailRef = useRef<SVGPathElement>(null)
  const dotRefs = useRef<(HTMLSpanElement | null)[]>([])
  const cardRefs = useRef<(HTMLElement | null)[]>([])
  const [geo, setGeo] = useState<Geo | null>(null)
  const [reached, setReached] = useState<number>(reduce ? chapters.length : -1)
  const [phase, setPhase] = useState<'idle' | 'folding' | 'flying' | 'landed'>(reduce ? 'landed' : 'idle')
  const active = useRef(false)
  const last = chapters.length - 1

  /* ── geometry: measured from the real layout, rebuilt on resize ───────── */
  const measure = useCallback(() => {
    const el = root.current
    if (!el) return
    const box = el.getBoundingClientRect()
    const dots = dotRefs.current.map((d) => d?.getBoundingClientRect())
    const cards = cardRefs.current.map((c) => c?.getBoundingClientRect())
    if (dots.some((d) => !d) || cards.some((c) => !c)) return
    const lineX = dots[0]!.left + dots[0]!.width / 2 - box.left
    const ys = dots.map((d) => d!.top + d!.height / 2 - box.top)
    const cardLeft = Math.min(...cards.map((c) => c!.left - box.left))
    const phone = box.width < 640
    const planeSize = phone ? 28 : 40
    // how far the plane may lean toward the records without touching them,
    // and how far back out the other side of the line
    const toward = clamp(cardLeft - lineX - planeSize / 2 - 6, 10, 70)
    const away = phone ? Math.min(10, lineX - planeSize / 2) : clamp(lineX - planeSize / 2 - 8, 8, 34)

    const startY = ys[0] - (phone ? 70 : 120)
    const pts: [number, number][] = [[lineX + toward * 0.5, startY]]
    ys.forEach((y, i) => {
      if (i > 0) {
        // between stops the route swings back across the line
        const mid = (ys[i - 1] + y) / 2
        pts.push([lineX - away, mid])
      }
      // at each stop it leans toward the record: "this one mattered"
      pts.push([lineX + toward, y - 18])
      if (i < last) pts.push([lineX + toward * 0.55, y + 46])
    })
    // the landing: one small arc past the current dot, down beside its card
    const ly = ys[last]
    pts.push([lineX + toward * 0.2, ly + 54])
    pts.push([lineX + toward * 0.75, ly + 110])
    const d = smooth(pts)

    // a scratch path to measure the route once, on the main thread, now
    const probe = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    probe.setAttribute('d', d)
    const total = probe.getTotalLength()
    const lut: Geo['lut'] = []
    for (let len = 0; len <= total; len += 4) lut.push({ y: probe.getPointAtLength(len).y, len })
    lut.push({ y: probe.getPointAtLength(total).y, len: total })
    // the route only ever moves down in y: keep the table monotonic so a y
    // maps to one length
    for (let i = 1; i < lut.length; i++) if (lut[i].y < lut[i - 1].y) lut[i].y = lut[i - 1].y
    setGeo({ d, lut, stops: ys, startY, endY: lut[lut.length - 1].y, total, planeSize })
  }, [last])

  useLayoutEffect(() => {
    measure()
    const el = root.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(() => measure())
    ro.observe(el)
    document.fonts?.ready.then(() => measure())
    return () => ro.disconnect()
  }, [measure])

  /* ── only work while the timeline is near the screen ───────────────────── */
  useEffect(() => {
    const el = root.current
    if (!el || reduce) return
    const io = new IntersectionObserver(
      ([e]) => {
        active.current = e.isIntersecting
        // the paper folds the first time the journey arrives
        if (e.isIntersecting) setPhase((p) => (p === 'idle' ? 'folding' : p))
      },
      { rootMargin: '0px 0px -15% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [reduce])

  useEffect(() => {
    if (phase !== 'folding') return
    const id = window.setTimeout(() => setPhase('flying'), 820)
    return () => clearTimeout(id)
  }, [phase])

  /* ── flight: the plane's y is the reader's ─────────────────────────────── */
  const { scrollY } = useScroll()
  const target = useSpring(0, { stiffness: 140, damping: 30, mass: 0.6 })
  useMotionValueEvent(scrollY, 'change', (v) => {
    const el = root.current
    if (!el || !geo || reduce || !active.current) return
    const top = el.getBoundingClientRect().top + v
    target.set(v + window.innerHeight * 0.55 - top)
  })

  // a gentle slowdown around each stop: y is warped so the plane lingers
  const warp = useCallback(
    (y: number) => {
      if (!geo) return y
      let out = y
      for (const s of geo.stops) {
        const x = (y - s) / 70
        out -= 42 * x * Math.exp(-x * x)
      }
      return out
    },
    [geo],
  )

  const place = useCallback(
    (yRaw: number) => {
      const g = geo
      const path = pathRef.current
      const plane = planeRef.current
      if (!g || !path || !plane) return
      const y = clamp(warp(yRaw), g.startY, g.endY)
      // y -> length, from the table
      let lo = 0
      let hi = g.lut.length - 1
      while (lo < hi) {
        const mid = (lo + hi) >> 1
        if (g.lut[mid].y < y) lo = mid + 1
        else hi = mid
      }
      const len = g.lut[lo].len
      const p = path.getPointAtLength(len)
      const q = path.getPointAtLength(Math.min(g.total, len + 3))
      const ang = (Math.atan2(q.y - p.y, q.x - p.x) * 180) / Math.PI
      const landed = len >= g.total - 2
      // the plane is drawn nose-down: lean within ±25° of that, never flip;
      // once landed it rests tipped a little, like paper put down
      const rot = landed ? -6 : clamp(ang - 90, -25, 25)
      plane.style.transform = `translate(${p.x - g.planeSize / 2}px, ${p.y - g.planeSize / 2}px) rotate(${rot}deg)`
      if (trailRef.current) trailRef.current.style.strokeDashoffset = String(g.total - len)
      // arrivals: the furthest stop the plane has passed
      let n = -1
      g.stops.forEach((s, i) => {
        if (y >= s - 24) n = i
      })
      setReached((r) => (n > r ? n : r))
      setPhase((ph) => (landed ? 'landed' : ph === 'landed' ? 'flying' : ph))
    },
    [geo, warp],
  )
  useMotionValueEvent(target, 'change', (v) => {
    if (phase === 'flying' || phase === 'landed') place(v)
  })

  // when the geometry (re)builds or the fold finishes, put the plane where it belongs
  useEffect(() => {
    if (!geo) return
    if (reduce) {
      place(geo.endY + 1)
      return
    }
    if (phase === 'flying' || phase === 'landed') {
      const el = root.current
      if (el) target.jump(window.scrollY + window.innerHeight * 0.55 - (el.getBoundingClientRect().top + window.scrollY))
      place(target.get())
    } else {
      place(geo.startY)
    }
  }, [geo, phase === 'flying', reduce]) // eslint-disable-line react-hooks/exhaustive-deps

  /* ── render ────────────────────────────────────────────────────────────── */
  return (
    <div ref={root} className="relative">
      {/* the route: drawn only as far as the plane has flown */}
      {geo && (
        <svg aria-hidden className="pointer-events-none absolute inset-0 z-20 h-full w-full overflow-visible">
          <defs>
            <mask id="edu-trail-mask" maskUnits="userSpaceOnUse">
              <path
                ref={trailRef}
                d={geo.d}
                fill="none"
                stroke="#fff"
                strokeWidth={6}
                strokeDasharray={`${geo.total} ${geo.total}`}
                style={{ strokeDashoffset: reduce ? 0 : geo.total }}
              />
            </mask>
          </defs>
          <path ref={pathRef} d={geo.d} fill="none" stroke="none" />
          <path
            d={geo.d}
            fill="none"
            stroke="rgba(17,17,17,0.5)"
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeDasharray="5 7"
            mask="url(#edu-trail-mask)"
          />
        </svg>
      )}

      {/* the plane */}
      {geo && (
        <div
          ref={planeRef}
          aria-hidden
          className={`pointer-events-none absolute left-0 top-0 z-30 transition-[filter] ${phase === 'landed' ? 'pointer-events-auto hover:[&>*]:-translate-y-0.5' : ''}`}
          style={{ width: geo.planeSize, height: geo.planeSize, willChange: 'transform' }}
        >
          <PaperPlane phase={phase} reduce={reduce} />
        </div>
      )}

      {/* the line */}
      <span aria-hidden className="absolute bottom-8 left-[1.625rem] top-2 z-0 w-[1.5px] -translate-x-1/2 bg-[rgba(17,17,17,0.45)] md:left-[11rem]" />

      <ol className="relative m-0 list-none p-0">
        {chapters.map((ch, i) => (
          <Milestone
            key={ch.title}
            ch={ch}
            i={i}
            current={i === last && ch.to === undefined}
            count={counts[i]}
            on={i <= reached}
            reduce={reduce}
            dotRef={(el) => {
              dotRefs.current[i] = el
            }}
            cardRef={(el) => {
              cardRefs.current[i] = el
            }}
            t={t}
            last={i === last}
          />
        ))}
      </ol>
    </div>
  )
}

/* ── the plane itself: a scrap of the site's paper, folded ──────────────── */

function PaperPlane({ phase, reduce }: { phase: 'idle' | 'folding' | 'flying' | 'landed'; reduce: boolean }) {
  const folded = reduce || phase === 'flying' || phase === 'landed'
  const folding = phase === 'folding'
  return (
    <div className="relative h-full w-full transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]">
      {/* the scrap: flat paper, a crease drawn down it, its corners tucked in */}
      {!reduce && (
        <motion.svg
          viewBox="0 0 40 40"
          className="absolute inset-0 h-full w-full overflow-visible"
          initial={false}
          animate={{ opacity: folded ? 0 : phase === 'idle' ? 0 : 1 }}
          transition={{ duration: folded ? 0.15 : 0.2, delay: folded ? 0 : 0 }}
        >
          <motion.path
            d="M9 8.5L31.4 8L31.8 32.2L8.6 32.6Z"
            fill="#F3F0E8"
            stroke="#111"
            strokeWidth={1.9}
            strokeLinejoin="round"
            initial={false}
            animate={folding ? { d: ['M9 8.5L31.4 8L31.8 32.2L8.6 32.6Z', 'M9 8.5L31.4 8L31.8 32.2L8.6 32.6Z', 'M16 8.5L24.4 8L31.8 32.2L8.6 32.6Z'] } : {}}
            transition={{ duration: 0.55, times: [0, 0.4, 1], ease: EASE }}
          />
          <motion.path
            d="M20.2 8.4L20.2 32.4"
            stroke="rgba(17,17,17,0.35)"
            strokeWidth={1.2}
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: folding || folded ? 1 : 0 }}
            transition={{ duration: 0.25, ease: EASE }}
          />
        </motion.svg>
      )}
      {/* the plane: nose down, two wings, a fold line each, drawn a little off */}
      <motion.svg
        viewBox="0 0 40 40"
        className="absolute inset-0 h-full w-full overflow-visible"
        initial={false}
        animate={folded ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 6, scale: 0.85 }}
        transition={{ duration: reduce ? 0 : 0.32, delay: folding ? 0.5 : 0, ease: EASE }}
      >
        <path d="M20.3 37.2L5.6 4.4L20 13.6L34.6 4.9Z" fill="#F3F0E8" stroke="#111" strokeWidth={1.9} strokeLinejoin="round" strokeLinecap="round" />
        <path d="M20 13.6L20.3 37.2" stroke="#111" strokeWidth={1.6} strokeLinecap="round" />
        <path d="M12.6 9.1L19.6 30.4" stroke="rgba(17,17,17,0.25)" strokeWidth={1.1} strokeLinecap="round" />
        <path d="M27.8 9.4L21 30.2" stroke="rgba(17,17,17,0.25)" strokeWidth={1.1} strokeLinecap="round" />
      </motion.svg>
    </div>
  )
}

/* ── one stop: date, dot, record ────────────────────────────────────────── */

function Milestone({
  ch,
  i,
  current,
  count,
  on,
  reduce,
  dotRef,
  cardRef,
  t,
  last,
}: {
  ch: Chapter
  i: number
  current: boolean
  count: number
  on: boolean
  reduce: boolean
  dotRef: (el: HTMLSpanElement | null) => void
  cardRef: (el: HTMLElement | null) => void
  t: (typeof ui)['en']['education']
  last: boolean
}) {
  const [shown, setShown] = useState(reduce)
  const [burst, setBurst] = useState(false)
  // revealed once, the first render the plane has reached it (state adjusted
  // during render, React's pattern for deriving state from a prop change)
  if (on && !shown) {
    setShown(true)
    if (!reduce) setBurst(true)
  }
  const years = ch.years.replace(/present/i, t.present)
  const angle = i % 2 ? 1.2 : -1.4

  return (
    <li className={`relative grid grid-cols-[3.25rem_minmax(0,1fr)] md:grid-cols-[8rem_6rem_minmax(0,1fr)] ${last ? 'pb-8' : 'pb-16 md:pb-24'}`}>
      {/* the date: dim until the plane arrives */}
      <motion.div
        initial={false}
        animate={{ opacity: on ? 1 : 0.55, x: on ? 0 : -5 }}
        transition={{ duration: reduce ? 0 : 0.4, ease: EASE }}
        className="hidden pt-0.5 text-right md:block"
      >
        <p className="font-mono text-[0.9375rem] font-bold leading-tight text-fg">{years}</p>
        <p className="mt-1 font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-fg-muted th:tracking-normal">{ch.stage}</p>
        {current && (
          <span className="mt-2 inline-block rounded-[2px] border border-accent-text px-1.5 py-px font-mono text-[0.625rem] font-bold uppercase tracking-[0.15em] text-accent-text th:tracking-normal">
            {t.current}
          </span>
        )}
        {i === 0 && (
          <InkNote arrow="up-right" arrowWidth="w-9" arrowClassName="-top-9 right-0" delay={0.4} className="mt-12 hidden justify-end lg:flex">
            {t.notes.start}
          </InkNote>
        )}
      </motion.div>

      {/* the stop on the line */}
      <div className="relative flex justify-center">
        <span
          ref={dotRef}
          aria-hidden
          className={`relative z-10 mt-1 block h-5 w-5 rounded-full border-2 transition-colors duration-300 ${on ? 'border-[#111] bg-accent' : 'border-[#111] bg-[#F3F0E8]'}`}
        >
          {burst && (
            <motion.svg
              viewBox="0 0 40 40"
              className="absolute -inset-3 h-[calc(100%+1.5rem)] w-[calc(100%+1.5rem)] overflow-visible text-accent-text"
              initial={{ opacity: 1, scale: 0.7 }}
              animate={{ opacity: 0, scale: 1.15 }}
              transition={{ duration: 0.22, ease: EASE }}
              onAnimationComplete={() => setBurst(false)}
            >
              <g stroke="currentColor" strokeWidth={2.4} strokeLinecap="round">
                <path d="M20 3.5L20.6 9" />
                <path d="M36 19.4L30.6 20.2" />
                <path d="M20.4 36.5L19.6 31.4" />
                <path d="M4 20.6L9.2 19.8" />
              </g>
            </motion.svg>
          )}
        </span>
      </div>

      {/* the record */}
      <div className="min-w-0">
        {/* phone: the date above the card */}
        <p className="mb-2 font-mono text-[0.8125rem] font-bold text-fg md:hidden">
          {years} <span className="font-normal uppercase tracking-[0.12em] text-fg-muted th:tracking-normal">· {ch.stage}</span>
          {current && <span className="ml-2 rounded-[2px] border border-accent-text px-1 py-px text-[0.625rem] uppercase text-accent-text">{t.current}</span>}
        </p>
        <motion.article
          ref={cardRef}
          initial={reduce ? false : { opacity: 0, y: 14, rotate: angle }}
          animate={shown ? { opacity: 1, y: 0, rotate: angle * 0.25 } : undefined}
          // the plane brings it in; this is the safety net, so a record can
          // never stay hidden if the flight is late or the geometry is off
          viewport={{ once: true, amount: 0.7 }}
          onViewportEnter={() => setShown(true)}
          transition={{ duration: 0.55, ease: EASE }}
          className="relative rounded-[3px] border border-[#111]/45 bg-white text-[#111] shadow-[4px_4px_0_rgba(17,17,17,0.8)] motion-reduce:!rotate-0"
        >
          <div className={`grid gap-5 p-5 sm:p-6 xl:gap-7 ${ch.photo ? 'xl:grid-cols-[12rem_minmax(0,1fr)_11rem]' : 'xl:grid-cols-[12rem_minmax(0,1fr)]'}`}>
            {/* who and where */}
            <div className="flex items-start gap-3 xl:flex-col xl:border-r xl:border-dashed xl:border-[#111]/30 xl:pr-6">
              {ch.logo && (
                <Image src={ch.logo} alt={`${ch.school} crest`} width={56} height={56} sizes="56px" className="h-12 w-12 shrink-0 rounded-full border border-[#111]/30 bg-white object-contain p-1" />
              )}
              <div className="min-w-0">
                {ch.href ? (
                  <a href={ch.href} target="_blank" rel="noreferrer" className="font-mono text-[0.875rem] font-bold uppercase leading-snug underline-offset-4 hover:text-accent-text hover:underline th:normal-case">
                    {ch.school} ↗
                  </a>
                ) : (
                  <p className="font-mono text-[0.875rem] font-bold uppercase leading-snug th:normal-case">{ch.school}</p>
                )}
                <p className="mt-1 font-mono text-[0.75rem] uppercase tracking-[0.12em] text-[#111]/60 th:tracking-normal">{ch.stage}</p>
              </div>
            </div>

            {/* what changed */}
            <div className="min-w-0">
              <h3 className="font-sans text-[1.5rem] font-bold leading-tight th:leading-[1.4] sm:text-[1.75rem]">{ch.title}</h3>
              <p className="mt-2 max-w-[62ch] font-sans text-[0.9375rem] leading-7 text-[#111]/85 th:leading-[1.85]">{ch.summary}</p>
              {ch.achievements.length > 0 && (
                <ul className="mt-4 grid list-none gap-1.5 p-0">
                  {ch.achievements.map((a) => (
                    <li key={a} className="flex gap-2 font-mono text-[0.8125rem] leading-snug th:font-sans">
                      <span aria-hidden className="shrink-0 font-bold text-accent-text">✓</span>
                      {a}
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-4 flex flex-wrap items-center gap-1.5">
                {ch.focus.map((f) => (
                  <span key={f} className="rounded-[3px] border border-[#111]/35 px-2 py-0.5 font-mono text-[0.75rem]">
                    {f}
                  </span>
                ))}
                <span className="ml-auto font-mono text-[0.6875rem] uppercase tracking-[0.15em] text-[#111]/55 th:tracking-normal">
                  {count > 0 ? fmt(t.signals, { n: count }) : t.none}
                </span>
              </div>
              {ch.quote && <p className="mt-3 font-sans text-[0.875rem] italic text-[#111]/60">“{ch.quote}”</p>}
            </div>

            {/* a real photograph from that stretch, as a print */}
            {ch.photo && (
              <figure className="relative m-0 self-start justify-self-start rotate-[1.6deg] border border-[#111]/40 bg-white p-1.5 pb-2 shadow-[3px_3px_0_#111] transition-[rotate] duration-300 hover:rotate-[0.4deg] motion-reduce:rotate-0 xl:mt-1">
                <span aria-hidden className="absolute -top-2 left-1/2 h-4 w-14 -translate-x-1/2 -rotate-3 bg-[#e3d6b8]/85" />
                <Image src={ch.photo.src} alt={ch.photo.alt} width={360} height={240} sizes="(min-width: 1280px) 11rem, 60vw" className="block aspect-[3/2] w-full max-w-[16rem] object-cover" />
              </figure>
            )}
          </div>
          {/* a handwritten aside, only where the data says it is true */}
          {i === 1 && (
            <InkNote arrow="down-left" arrowWidth="w-10" arrowClassName="-bottom-9 -left-9" delay={0.3} className="absolute -top-14 right-4 hidden md:block">
              {t.notes.turn}
            </InkNote>
          )}
        </motion.article>
        {current && (
          <InkNote delay={0.6} className="mt-6 flex md:-ml-2">
            {t.notes.going}
          </InkNote>
        )}
      </div>
    </li>
  )
}
