'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import CertLightbox from '@/components/ui/CertLightbox'
import { certThumb, categorize, catMeta, CATS, groupByCategory, certStats, LEVEL_TAG } from '@/lib/certs'
import type { Certificate } from '@/data/portfolio'

/**
 * The archive as an endless board.
 *
 * The certificates tile across an infinite plane you drag around. Only the
 * cells inside the viewport are rendered, so the board can run forever without
 * the DOM growing: pan far enough and cards are recycled behind you.
 *
 * Which certificate lands in a cell is a pure function of that cell's (col,row),
 * never random - drag back to a spot and the same document is waiting there.
 * The multipliers are coprime with a wide stride so neighbours differ and the
 * repeat is hard to read as a repeat.
 *
 * Two things keep 40 competing cards from reading as noise:
 *   fisheye - cards swell and sharpen near the pointer and shrink away from it,
 *             so the eye always has one place to rest
 *   inertia - the board keeps travelling after you let go and settles under
 *             friction, so panning feels weighted instead of jumping
 */

const CELL_W = 268
const CELL_H = 250
const CARD_W = 244
// how far the lens reaches, in px
const LENS_R = 560

const mod = (n: number, m: number) => ((n % m) + m) % m
const pick = (col: number, row: number, n: number) => mod(col * 7 + row * 23, n)

export default function CertArchive() {
  const [cat, setCat] = useState('all')
  const [active, setActive] = useState<Certificate | null>(null)
  // start clear of the toolbar rather than under it
  const HOME = { x: 24, y: 64 }
  const [offset, setOffset] = useState(HOME)
  const [size, setSize] = useState({ w: 1200, h: 800 })

  const boardRef = useRef<HTMLDivElement>(null)
  const drag = useRef({ on: false, x: 0, y: 0, ox: 0, oy: 0, moved: false })
  // last two samples drive the throw velocity
  const vel = useRef({ x: 0, y: 0, t: 0, px: 0, py: 0 })
  const glide = useRef(0)
  // pointer in board space; null falls back to the middle of the view
  const [focus, setFocus] = useState<{ x: number; y: number } | null>(null)
  const focusRaf = useRef(0)
  const [still, setStill] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setStill(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  const byCat = useMemo(groupByCategory, [])
  const pool = byCat.get(cat) ?? []

  useEffect(() => {
    const measure = () => {
      const el = boardRef.current
      if (el) setSize({ w: el.clientWidth, h: el.clientHeight })
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  // a new filter means a new pool, so start from the origin again
  useEffect(() => setOffset(HOME), [cat])

  // wheel pans the board rather than the page - this page has nothing to scroll
  useEffect(() => {
    const el = boardRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      setOffset((o) => ({ x: o.x - e.deltaX, y: o.y - e.deltaY }))
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    cancelAnimationFrame(glide.current)
    drag.current = { on: true, x: e.clientX, y: e.clientY, ox: 0, oy: 0, moved: false }
    vel.current = { x: 0, y: 0, t: performance.now(), px: e.clientX, py: e.clientY }
    setOffset((o) => {
      drag.current.ox = o.x
      drag.current.oy = o.y
      return o
    })
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }, [])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    // fisheye focus, rAF-throttled: a setState per raw mousemove would re-render
    // every card dozens of times a second
    const cx = e.clientX
    const cy = e.clientY
    if (!focusRaf.current) {
      focusRaf.current = requestAnimationFrame(() => {
        focusRaf.current = 0
        const r = boardRef.current?.getBoundingClientRect()
        setFocus({ x: cx - (r?.left ?? 0), y: cy - (r?.top ?? 0) })
      })
    }

    const d = drag.current
    if (!d.on) return
    const now = performance.now()
    const dt = now - vel.current.t
    if (dt > 0) {
      vel.current = {
        x: (cx - vel.current.px) / dt,
        y: (cy - vel.current.py) / dt,
        t: now,
        px: cx,
        py: cy,
      }
    }
    const dx = cx - d.x
    const dy = cy - d.y
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) d.moved = true
    setOffset({ x: d.ox + dx, y: d.oy + dy })
  }, [])

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      drag.current.on = false
      try {
        ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
      } catch {}

      if (still) return
      // throw: carry the release velocity and bleed it off under friction
      let vx = vel.current.x * 16
      let vy = vel.current.y * 16
      if (Math.hypot(vx, vy) < 1.5) return
      const step = () => {
        vx *= 0.93
        vy *= 0.93
        setOffset((o) => ({ x: o.x + vx, y: o.y + vy }))
        if (Math.hypot(vx, vy) > 0.15) glide.current = requestAnimationFrame(step)
      }
      glide.current = requestAnimationFrame(step)
    },
    [still],
  )

  useEffect(() => () => cancelAnimationFrame(glide.current), [])

  // only the cells the viewport can see, plus a ring of margin
  const cells = useMemo(() => {
    if (!pool.length) return []
    const c0 = Math.floor(-offset.x / CELL_W) - 1
    const r0 = Math.floor(-offset.y / CELL_H) - 1
    const cn = Math.ceil(size.w / CELL_W) + 2
    const rn = Math.ceil(size.h / CELL_H) + 2
    const out: { key: string; x: number; y: number; cert: Certificate }[] = []
    for (let r = r0; r < r0 + rn; r++) {
      for (let c = c0; c < c0 + cn; c++) {
        // stagger every other row so the grid reads as a board, not a spreadsheet
        const stagger = mod(r, 2) === 0 ? 0 : CELL_W / 2
        out.push({
          key: `${c}:${r}`,
          x: c * CELL_W + stagger,
          y: r * CELL_H,
          cert: pool[pick(c, r, pool.length)],
        })
      }
    }
    return out
  }, [offset.x, offset.y, size.w, size.h, pool])

  return (
    <main className="fixed inset-0 overflow-hidden bg-neutral-200">
      {/* the board surface */}
      <div
        ref={boardRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerLeave={() => setFocus(null)}
        className="absolute inset-0 cursor-grab touch-none select-none active:cursor-grabbing"
        style={{
          backgroundColor: '#e9e9e7',
          backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.13) 1px, transparent 1px)',
          backgroundSize: '26px 26px',
          backgroundPosition: `${mod(offset.x, 26)}px ${mod(offset.y, 26)}px`,
        }}
      >
        {cells.map(({ key, x, y, cert }) => {
          // fisheye: distance from the lens centre drives size, clarity and depth
          const sx = x + offset.x + CARD_W / 2
          const sy = y + offset.y + CELL_H / 2
          const fx = focus?.x ?? size.w / 2
          const fy = focus?.y ?? size.h / 2
          const d = Math.hypot(sx - fx, sy - fy) / LENS_R
          const near = still ? 0.5 : Math.max(0, 1 - d)
          const scale = 0.74 + 0.44 * Math.pow(near, 1.5)
          const dim = 0.34 + 0.66 * Math.pow(near, 0.7)
          const soft = (1 - near) * 1.6
          return (
            <button
              key={key}
              onClick={() => {
                if (!drag.current.moved) setActive(cert)
              }}
              style={{
                transform: `translate3d(${x + offset.x}px, ${y + offset.y}px, 0) scale(${scale})`,
                width: CARD_W,
                opacity: dim,
                filter: soft > 0.12 ? `blur(${soft.toFixed(2)}px)` : undefined,
                zIndex: Math.round(near * 100),
              }}
              className="absolute left-0 top-0 flex origin-center flex-col overflow-hidden rounded-xl border border-black/10 bg-white text-left shadow-[0_6px_18px_-8px_rgba(0,0,0,0.35)] transition-shadow hover:shadow-[0_16px_40px_-12px_rgba(0,0,0,0.5)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
            >
            <div className="relative aspect-[4/3] w-full bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={certThumb(cert.file)}
                alt={cert.title}
                loading="lazy"
                draggable={false}
                className="absolute inset-0 h-full w-full object-contain p-1.5"
              />
              {cert.medal && (
                <span
                  className={`absolute right-2 top-2 rounded-full px-1.5 py-0.5 font-sans text-[9px] font-bold ${cert.medal === 'gold' ? 'bg-neutral-900 text-white' : 'border border-neutral-900/60 bg-white text-neutral-900'}`}
                >
                  {cert.medal === 'gold' ? 'GOLD' : '3RD'}
                </span>
              )}
              {cert.level && !cert.medal && (cert.level === 'National' || cert.level === 'International') && (
                <span className="absolute right-2 top-2 rounded bg-neutral-900/85 px-1 py-px font-mono text-[8px] font-semibold tracking-wider text-white">
                  {LEVEL_TAG[cert.level]}
                </span>
              )}
            </div>
            <div className="border-t border-neutral-100 px-3 py-2">
              <span
                className={`inline-block rounded-full px-2 py-0.5 font-sans text-[10px] font-semibold ${catMeta(categorize(cert)).chip}`}
              >
                {catMeta(categorize(cert)).label}
              </span>
              <h3 className="mt-1 line-clamp-2 font-sans text-[13px] font-semibold leading-snug text-neutral-900">
                {cert.title}
              </h3>
              {cert.issuer && (
                <p className="mt-0.5 truncate font-sans text-[11px] text-neutral-500">{cert.issuer}</p>
              )}
              </div>
            </button>
          )
        })}
      </div>

      {/* chrome floats over the board */}
      {/* solid, not a gradient: the board underneath is busy white cards and a
          fade left this unreadable */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-black/10 bg-white/95 px-4 py-2.5 shadow-[0_2px_12px_-6px_rgba(0,0,0,0.3)] backdrop-blur-sm sm:px-6">
        <Link
          href="/#certificates"
          className="pointer-events-auto shrink-0 font-mono text-[11px] uppercase tracking-wider text-neutral-500 transition-colors hover:text-neutral-900"
        >
          &#8592; Back
        </Link>
        <h1 className="shrink-0 font-crt text-2xl leading-none text-neutral-900 sm:text-3xl">
          CERTIFICATES
        </h1>
        <span className="shrink-0 font-mono text-[11px] uppercase tracking-wider text-neutral-500">
          {certStats.total} records · {certStats.gold} gold · {certStats.national} national
        </span>

        <div className="pointer-events-auto ml-auto flex flex-wrap gap-1.5">
          {CATS.map((c) => {
            const on = c.key === cat
            return (
              <button
                key={c.key}
                onClick={() => setCat(c.key)}
                aria-pressed={on}
                className={`rounded-full px-3 py-1 font-sans text-[12px] font-medium transition-colors ${
                  on
                    ? 'bg-neutral-900 text-white'
                    : 'border border-black/10 bg-white text-neutral-600 hover:border-neutral-900 hover:text-neutral-900'
                }`}
              >
                {c.label}
                <span className={on ? 'ml-1.5 text-white/50' : 'ml-1.5 text-neutral-400'}>
                  {(byCat.get(c.key) ?? []).length}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-center justify-between gap-3 px-4 pb-4 sm:px-6">
        <span className="rounded-full border border-black/10 bg-white/95 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-neutral-500 shadow-sm">
          drag anywhere · scroll to pan · click to open
        </span>
        <button
          onClick={() => setOffset(HOME)}
          className="pointer-events-auto rounded-full border border-black/15 bg-white/95 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-neutral-600 shadow-sm transition-colors hover:border-neutral-900 hover:text-neutral-900"
        >
          recentre
        </button>
      </div>

      <CertLightbox cert={active} onClose={() => setActive(null)} />
    </main>
  )
}
