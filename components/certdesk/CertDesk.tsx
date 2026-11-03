'use client'

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { motion, useDragControls, useInView, useReducedMotion } from 'motion/react'
import Duck from '@/components/duck/Duck'
import DeskNotes from '@/components/certdesk/DeskNotes'
import { SLOTS, PEEK_SLOT, aspectOf, sheetSize, focusSize, type Box } from '@/components/certdesk/layout'
import { certSrc, certThumb } from '@/lib/certs'
import { getLenis } from '@/lib/smooth-scroll'
import type { Certificate } from '@/data/portfolio'

/**
 * The certificate desk: the featured certificates as sheets of paper put
 * down on a desk, not tiles in a grid.
 *
 *   arriving  the desk is empty; the duck walks in with the stack, drops it,
 *             and the sheets slide out to where they lie. Then it ducks
 *             behind one of them. About a second and a half, once.
 *   hover     the nearest sheet is lifted: it rises, straightens, comes
 *             forward a little, and the sheets round it shuffle aside by a
 *             few pixels. A few of them have a note pencilled beside them.
 *   pick up   the sheet slides to the middle of the desk and grows, the
 *             others slide off toward the edges, and notes are written
 *             round it (DeskNotes). Putting it back runs the other way:
 *             the notes go first, then the sheet drops into its place.
 *
 * Everything moves on springs from the sheets' resting places, which are a
 * share of the desk's measured size (layout.ts) - so nothing is measured per
 * frame and nothing re-renders while a sheet is in flight. The desk only
 * re-renders when what is lifted or picked up changes.
 *
 * A phone gets its own desk (PhoneStack): the sheets overlap down the page,
 * a tap pulls one up over the page, and a swipe down puts it back.
 *
 * Every sheet is a button. Escape puts a picked-up sheet back and focus goes
 * back to it; while one is up, the rest of the desk is inert.
 */
const SPRING = { type: 'spring', stiffness: 260, damping: 26, mass: 0.9 } as const
const SLIDE = { type: 'spring', stiffness: 170, damping: 24 } as const
const DUCK_W = 112
const DUCK_H = DUCK_W * (1012 / 538) // the stand pose's drawing

type Phase = 'waiting' | 'carry' | 'drop' | 'settled'

export default function CertDesk({
  certs,
  onScan,
}: {
  certs: Certificate[]
  /** open the full scan (and the event's photos) in the lightbox */
  onScan: (c: Certificate) => void
}) {
  const [phone, setPhone] = useState<boolean | null>(null)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const sync = () => setPhone(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])
  if (phone === null) return <div className="aspect-[1/0.62] w-full" />
  return phone ? <PhoneStack certs={certs} onScan={onScan} /> : <Desk certs={certs} onScan={onScan} />
}

/* ── the desk ──────────────────────────────────────────────────────────── */

function Desk({ certs, onScan }: { certs: Certificate[]; onScan: (c: Certificate) => void }) {
  const reduce = !!useReducedMotion()
  const deskRef = useRef<HTMLDivElement>(null)
  const sheetRefs = useRef<(HTMLButtonElement | null)[]>([])
  const closeRef = useRef<HTMLButtonElement>(null)
  const [desk, setDesk] = useState<Box>({ w: 0, h: 0 })
  const [phase, setPhase] = useState<Phase>(reduce ? 'settled' : 'waiting')
  const [hover, setHover] = useState<number | null>(null)
  const [focus, setFocus] = useState<number | null>(null)
  const [notesOn, setNotesOn] = useState(false)
  const [asleep, setAsleep] = useState(false)
  const [nudge, setNudge] = useState(false)
  const inView = useInView(deskRef, { once: true, amount: 0.35 })

  // the desk's size: the sheets are placed as a share of it
  useLayoutEffect(() => {
    const el = deskRef.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setDesk({ w: e.contentRect.width, h: e.contentRect.height }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // the arrival: walk in with the stack, drop it, get out of the way
  useEffect(() => {
    if (!inView || reduce || phase !== 'waiting') return
    setPhase('carry')
    const a = window.setTimeout(() => setPhase('drop'), 700)
    const b = window.setTimeout(() => setPhase('settled'), 1500)
    return () => {
      clearTimeout(a)
      clearTimeout(b)
    }
  }, [inView, reduce]) // eslint-disable-line react-hooks/exhaustive-deps

  // left alone for a while, the duck falls asleep on its sheet
  useEffect(() => {
    if (phase !== 'settled' || reduce) return
    let id = window.setTimeout(() => setAsleep(true), 22000)
    const wake = () => {
      setAsleep(false)
      clearTimeout(id)
      id = window.setTimeout(() => setAsleep(true), 22000)
    }
    const el = deskRef.current
    el?.addEventListener('pointermove', wake)
    el?.addEventListener('focusin', wake)
    return () => {
      clearTimeout(id)
      el?.removeEventListener('pointermove', wake)
      el?.removeEventListener('focusin', wake)
    }
  }, [phase, reduce])

  const share = desk.w >= 1024 ? 0.2 : 0.24
  const sheets = useMemo(
    () =>
      certs.map((c, i) => {
        const s = SLOTS[i % SLOTS.length]
        const size = sheetSize(c.file, desk, share)
        return { c, s, size, cx: s.x * desk.w, cy: s.y * desk.h }
      }),
    [certs, desk, share],
  )

  /* picking up and putting back */
  const open = useCallback(
    (i: number) => {
      setHover(null)
      setFocus(i)
      setNotesOn(false)
      // bring the whole desk on screen first: the sheet is going to its middle
      const el = deskRef.current
      if (el) {
        const r = el.getBoundingClientRect()
        const off = Math.min(0, -(window.innerHeight - r.height) / 2)
        if (r.top < 0 || r.bottom > window.innerHeight) {
          const lenis = getLenis()
          if (lenis) lenis.scrollTo(el, { offset: off, duration: reduce ? 0 : 0.7 })
          else el.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' })
        }
      }
    },
    [reduce],
  )
  // the notes are written once the sheet has landed
  useEffect(() => {
    if (focus === null) return
    const id = window.setTimeout(() => {
      setNotesOn(true)
      closeRef.current?.focus({ preventScroll: true })
    }, reduce ? 0 : 380)
    return () => clearTimeout(id)
  }, [focus, reduce])
  const close = useCallback(() => {
    if (focus === null) return
    const i = focus
    setNotesOn(false)
    // the notes go first, then the sheet drops back
    window.setTimeout(
      () => {
        setFocus(null)
        sheetRefs.current[i]?.focus({ preventScroll: true })
      },
      reduce ? 0 : 160,
    )
  }, [focus, reduce])
  useEffect(() => {
    if (focus === null) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [focus, close])

  /* hover by proximity: the sheet nearest the pointer, within reach */
  const onMove = (e: React.PointerEvent) => {
    if (focus !== null || phase === 'waiting' || phase === 'carry' || e.pointerType !== 'mouse') return
    const r = deskRef.current!.getBoundingClientRect()
    const px = e.clientX - r.left
    const py = e.clientY - r.top
    let best: number | null = null
    let bestD = Infinity
    sheets.forEach(({ cx, cy, size }, i) => {
      // distance to the sheet's edge, so a big sheet is not out-pulled by a
      // small one whose centre happens to be nearer
      const dx = Math.max(Math.abs(px - cx) - size.w / 2, 0)
      const dy = Math.max(Math.abs(py - cy) - size.h / 2, 0)
      const d = Math.hypot(dx, dy) - i * 0.01 // later sheets lie on top
      if (d < bestD) {
        bestD = d
        best = i
      }
    })
    const next = bestD < 36 ? best : null
    if (next !== hover) setHover(next)
  }

  const ready = desk.w > 0
  const peek = sheets[PEEK_SLOT] ?? sheets[sheets.length - 1]
  const focusBox = focus !== null && ready ? focusSize(sheets[focus].c.file, desk) : null
  const focusRect = focusBox ? { x: desk.w / 2 - focusBox.w / 2, y: desk.h / 2 - focusBox.h / 2, ...focusBox } : null

  // the duck: walks in, drops the stack, then stands on the peek sheet
  const duckAt = (() => {
    const floor = desk.h - DUCK_H + 8
    if (phase === 'waiting') return { x: desk.w + 40, y: floor }
    if (phase === 'carry') return { x: desk.w * 0.5 - DUCK_W / 2, y: floor }
    if (phase === 'drop') return { x: desk.w * 0.5 - DUCK_W / 2, y: floor }
    if (!peek) return { x: desk.w - DUCK_W, y: floor }
    // standing on the top edge of its sheet, all of it in front: tucked
    // behind the sheet, the duck read as covered up rather than peeking
    return { x: peek.cx + peek.size.w * 0.18 - DUCK_W / 2, y: peek.cy - peek.size.h / 2 - DUCK_H * 0.93 }
  })()
  const stack = { x: duckAt.x + DUCK_W / 2, y: duckAt.y + DUCK_H * 0.42 }
  // it looks the way of the picked-up sheet
  const facing = focus !== null && focusRect && focusRect.x + focusRect.w / 2 < duckAt.x ? -1 : 1

  return (
    <div>
      <div
        ref={deskRef}
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
        onClick={(e) => {
          if (focus !== null && e.target === e.currentTarget) close()
        }}
        className="relative w-full select-none overflow-x-clip [contain:layout]"
        style={{ aspectRatio: desk.w && desk.w < 1024 ? '1 / 0.74' : '1 / 0.6' }}
      >
        {ready &&
          sheets.map(({ c, s, size, cx, cy }, i) => {
            const isFocus = focus === i
            const isHover = hover === i && focus === null
            let x = cx
            let y = cy
            let rotate = s.r
            let scale = 1
            let opacity = 1
            if (phase === 'waiting' || phase === 'carry') {
              // in the duck's arms: a squared-up stack, slightly fanned
              x = stack.x + ((i % 3) - 1) * 3
              y = stack.y - i * 1.5
              rotate = ((i * 37) % 7) - 3
              scale = 0.42
            } else if (focusRect) {
              if (isFocus) {
                x = desk.w / 2
                y = desk.h / 2
                rotate = 0
                scale = focusRect.w / size.w
              } else {
                // slid off toward the nearer edge, out of the way
                const dir = cx < desk.w / 2 ? -1 : 1
                x = cx + dir * desk.w * 0.3
                y = cy + (cy - desk.h / 2) * 0.12
                scale = 0.92
                opacity = 0.35
              }
            } else if (isHover) {
              y = cy - 6
              rotate = s.r * 0.15
              scale = 1.035
            } else if (hover !== null && phase !== 'drop') {
              // shuffled aside by the lifted one, a few px, less the further away
              const h = sheets[hover]
              const dx = cx - h.cx
              const dy = cy - h.cy
              const d = Math.hypot(dx, dy) || 1
              const push = 12 * Math.max(0, 1 - d / (desk.w * 0.32))
              x += (dx / d) * push
              y += (dy / d) * push
            }
            if (i === PEEK_SLOT && nudge && focus === null) {
              x -= 6
              rotate += 1.2
            }
            const z = isFocus ? 60 : isHover ? 40 : i === PEEK_SLOT ? 21 : i + 1
            const lift = isHover || isFocus
            return (
              <motion.button
                key={c.file}
                ref={(el) => {
                  sheetRefs.current[i] = el
                }}
                type="button"
                onClick={() => (isFocus ? close() : open(i))}
                onFocus={() => focus === null && setHover(i)}
                onBlur={() => setHover((h) => (h === i ? null : h))}
                inert={focus !== null && !isFocus}
                aria-label={`${c.title}${c.result ? `, ${c.result}` : ''}. ${isFocus ? 'Put it back' : 'Pick it up'}`}
                aria-expanded={isFocus}
                data-cursor-label={isFocus ? 'put back' : 'pick up'}
                initial={false}
                animate={{ x: x - size.w / 2, y: y - size.h / 2, rotate, scale, opacity }}
                transition={
                  reduce
                    ? { duration: 0 }
                    : phase === 'carry'
                      ? { duration: 0.65, ease: [0.3, 0.7, 0.4, 1] }
                      : phase === 'drop'
                        ? { ...SLIDE, delay: i * 0.03 }
                        : focus !== null || isFocus
                          ? SLIDE
                          : SPRING
                }
                style={{ width: size.w, height: size.h, zIndex: z }}
                className={`absolute left-0 top-0 origin-center bg-white p-[3px] outline-offset-4 transition-shadow duration-300 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-fg ${
                  lift
                    ? 'shadow-[0_2px_4px_rgba(17,17,17,0.06),0_18px_30px_-16px_rgba(17,17,17,0.35)]'
                    : 'shadow-[0_1px_2px_rgba(17,17,17,0.06),0_8px_18px_-14px_rgba(17,17,17,0.3)]'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={certThumb(c.file)} alt="" loading="lazy" decoding="async" draggable={false} className="block h-full w-full object-cover" />
                {/* the full scan, once the sheet is up close enough to need it */}
                {isFocus && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={certSrc(c.file)}
                    alt=""
                    decoding="async"
                    draggable={false}
                    onLoad={(e) => (e.currentTarget.style.opacity = '1')}
                    style={{ opacity: 0 }}
                    className="absolute inset-[3px] h-[calc(100%-6px)] w-[calc(100%-6px)] object-cover transition-opacity duration-300"
                  />
                )}
              </motion.button>
            )
          })}

        {/* the pencilled asides: only a few sheets have one */}
        {ready &&
          phase === 'settled' &&
          sheets.map(({ c, size, cx, cy }, i) =>
            c.note ? (
              <motion.p
                key={c.file}
                aria-hidden
                initial={false}
                animate={{ opacity: hover === i && focus === null ? 1 : 0, y: hover === i ? 0 : 4 }}
                transition={{ duration: reduce ? 0 : 0.25, delay: hover === i ? 0.12 : 0 }}
                style={{
                  left: cx > desk.w * 0.7 ? undefined : cx + size.w / 2 + 6,
                  right: cx > desk.w * 0.7 ? desk.w - (cx - size.w / 2) + 6 : undefined,
                  top: cy - size.h / 2 - 14,
                }}
                className="pointer-events-none absolute z-50 -rotate-3 whitespace-nowrap font-hand text-[1.125rem] text-accent-text"
              >
                {c.note}
              </motion.p>
            ) : null,
          )}

        {/* the duck */}
        {ready && (
          <motion.div
            aria-hidden
            initial={false}
            animate={{
              x: duckAt.x,
              y: phase === 'drop' && !reduce ? [duckAt.y, duckAt.y - 14, duckAt.y] : duckAt.y,
              opacity: focus !== null ? 0.9 : 1,
            }}
            transition={
              reduce
                ? { duration: 0 }
                : phase === 'carry'
                  ? { duration: 0.65, ease: [0.3, 0.7, 0.4, 1] }
                  : phase === 'drop'
                    ? { duration: 0.35, ease: 'easeOut' }
                    : { type: 'spring', stiffness: 120, damping: 18 }
            }
            style={{ width: DUCK_W, zIndex: phase === 'settled' ? 22 : 30 }}
            className="absolute left-0 top-0"
            onPointerEnter={() => setNudge(true)}
            onPointerLeave={() => setNudge(false)}
          >
            <motion.div animate={{ scaleX: facing }} transition={{ duration: reduce ? 0 : 0.2 }}>
              {asleep ? (
                <div className="translate-y-[12%]">
                  <Duck pose="sleep" width={DUCK_W * 1.25} />
                </div>
              ) : (
                <Duck pose="stand" width={DUCK_W} />
              )}
            </motion.div>
          </motion.div>
        )}

        {/* the notes round the picked-up sheet */}
        {focus !== null && focusRect && (
          <DeskNotes
            cert={sheets[focus].c}
            rect={focusRect}
            desk={desk}
            shown={notesOn}
            reduce={reduce}
            onClose={close}
            onScan={() => onScan(sheets[focus].c)}
            closeRef={closeRef}
          />
        )}
      </div>
    </div>
  )
}

/* ── the phone: a stack down the page ─────────────────────────────────── */

const PHONE_TURN = [-2, 1.5, -0.5, 2, -1.5, 1, -1, 0.5, 2, -2, 1, -0.8]

function PhoneStack({ certs, onScan }: { certs: Certificate[]; onScan: (c: Certificate) => void }) {
  const reduce = !!useReducedMotion()
  const [focus, setFocus] = useState<number | null>(null)
  const [up, setUp] = useState(false)
  const sheetRefs = useRef<(HTMLButtonElement | null)[]>([])
  const closeRef = useRef<HTMLButtonElement>(null)
  // dragged by its top (the bar, the hint and the sheet), so the notes
  // below still scroll like a page
  const drag = useDragControls()

  const open = (i: number) => {
    setFocus(i)
    setUp(true)
  }
  const close = useCallback(() => {
    setUp(false)
    const i = focus
    window.setTimeout(
      () => {
        setFocus(null)
        if (i !== null) sheetRefs.current[i]?.focus({ preventScroll: true })
      },
      reduce ? 0 : 320,
    )
  }, [focus, reduce])

  // the page stays put under the pulled-up sheet
  useEffect(() => {
    if (!up) return
    const lenis = getLenis()
    lenis?.stop()
    const prev = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    const id = window.setTimeout(() => closeRef.current?.focus({ preventScroll: true }), reduce ? 0 : 300)
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    return () => {
      clearTimeout(id)
      lenis?.start()
      document.documentElement.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [up, close, reduce])

  const c = focus !== null ? certs[focus] : null

  return (
    <div className="relative">
      {/* the duck sits on the top of the pile */}
      <div aria-hidden className="pointer-events-none absolute -top-14 right-2 z-30">
        <Duck pose="stand" width={70} />
      </div>
      <ol className="m-0 list-none p-0">
        {certs.map((cert, i) => (
          <motion.li
            key={cert.file}
            initial={reduce ? false : { opacity: 0, y: -24, rotate: PHONE_TURN[i % PHONE_TURN.length] * 3 }}
            whileInView={{ opacity: 1, y: 0, rotate: PHONE_TURN[i % PHONE_TURN.length] }}
            viewport={{ once: true, amount: 0.3 }}
            transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 200, damping: 22, delay: (i % 3) * 0.04 }}
            // an upright certificate is drawn narrower, to the same paper area
            style={{
              zIndex: i + 1,
              width: aspectOf(cert.file) >= 1 ? '86%' : '62%',
              marginLeft: i % 2 ? (aspectOf(cert.file) >= 1 ? '10%' : '30%') : '2%',
              marginTop: i ? '-22%' : 0,
            }}
            className="relative"
          >
            <button
              ref={(el) => {
                sheetRefs.current[i] = el
              }}
              type="button"
              onClick={() => open(i)}
              aria-label={`${cert.title}${cert.result ? `, ${cert.result}` : ''}. Pick it up`}
              className="block w-full bg-white p-[3px] text-left shadow-[0_1px_2px_rgba(17,17,17,0.06),0_10px_22px_-16px_rgba(17,17,17,0.35)] focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={certThumb(cert.file)} alt="" loading="lazy" decoding="async" className="block h-auto w-full" />
            </button>
          </motion.li>
        ))}
      </ol>

      {/* the pulled-up sheet: over the page, not in a box */}
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={c?.title ?? ''}
        inert={!up}
        initial={false}
        animate={{ opacity: up ? 1 : 0 }}
        transition={{ duration: reduce ? 0 : 0.2 }}
        className={`fixed inset-0 z-[90] bg-bg ${up ? '' : 'pointer-events-none'}`}
      >
        {c && (
          <motion.div
            drag={reduce ? false : 'y'}
            dragControls={drag}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.7 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 90 || info.velocity.y > 600) close()
            }}
            initial={false}
            animate={{ y: up ? 0 : '60%' }}
            transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 220, damping: 26 }}
            data-lenis-prevent
            className="h-full overflow-y-auto overscroll-contain px-5 pb-10 pt-20"
          >
            <div onPointerDown={(e) => drag.start(e)} className="touch-none">
            <div aria-hidden className="mx-auto mb-3 h-1 w-10 rounded-full bg-fg/25" />
            <p className="text-center font-mono text-[0.6875rem] uppercase tracking-[0.06em] text-fg-dim th:tracking-normal">swipe down to put it back</p>
            <motion.div
              initial={false}
              animate={{ rotate: up ? 0 : PHONE_TURN[(focus ?? 0) % PHONE_TURN.length], scale: up ? 1 : 0.94 }}
              transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 200, damping: 20 }}
              className="mx-auto mt-4 bg-white p-[3px] shadow-[0_2px_4px_rgba(17,17,17,0.06),0_18px_30px_-16px_rgba(17,17,17,0.35)]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={certSrc(c.file)} alt={c.title} draggable={false} className="block h-auto w-full" />
            </motion.div>
            </div>
            <h3 className="mt-5 font-sans text-[1.125rem] font-semibold leading-snug text-fg">{c.title}</h3>
            {c.blurb && <p className="mt-1 font-sans text-[0.9375rem] leading-snug text-fg-muted">{c.blurb}</p>}
            <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-5">
              <div>
                <p className="font-mono text-[0.6875rem] uppercase tracking-[0.06em] text-fg-dim th:tracking-normal">{c.medal ? 'Award' : 'Result'}</p>
                <p className="mt-1 font-hand text-[1.25rem] leading-tight text-fg">{c.result ?? 'Completed'}</p>
                <p className="mt-1 font-mono text-[0.75rem] text-fg-muted">{[c.level, c.date].filter(Boolean).join(' · ')}</p>
              </div>
              <div>
                <p className="font-mono text-[0.6875rem] uppercase tracking-[0.06em] text-fg-dim th:tracking-normal">Issued by</p>
                <p className="mt-1 font-hand text-[1.0625rem] leading-snug text-fg">{c.issuer}</p>
              </div>
              {c.learned?.length ? (
                <div className="col-span-2">
                  <p className="font-mono text-[0.6875rem] uppercase tracking-[0.06em] text-fg-dim th:tracking-normal">What I learned</p>
                  <ul className="m-0 mt-1 list-none space-y-0.5 p-0 font-hand text-[1.0625rem] leading-snug text-fg">
                    {c.learned.map((l) => (
                      <li key={l}>{l}</li>
                    ))}
                  </ul>
                  {c.skills?.length ? <p className="mt-2 font-mono text-[0.75rem] text-fg-muted">{c.skills.join(' · ')}</p> : null}
                </div>
              ) : null}
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 font-mono text-[0.75rem] uppercase tracking-[0.04em] th:tracking-normal">
              <button type="button" onClick={() => onScan(c)} className="rounded-[3px] bg-[#111] px-3 py-2 text-[rgb(var(--bg))]">
                {c.moment ? 'The scan + photos' : 'The full scan'} ↗
              </button>
              <button ref={closeRef} type="button" onClick={close} className="py-2 text-fg underline underline-offset-4">
                Put it back ↓
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
