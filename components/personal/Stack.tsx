'use client'

import { useCallback, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import PrintCard, { type Album } from '@/components/personal/PrintCard'

/**
 * The prints as a pile, for a phone. Thirteen scattered cards cannot work at
 * 390px, so below `lg` they stack: the top one fills the width, flick it away
 * and it goes to the bottom of the pile, tap it to turn it over.
 *
 * Nothing unmounts. The pile is an order, every print is always rendered, and
 * a flick rotates the order - each card then animates to its new slot. That
 * is deliberate: this project forbids framer's exit animations, and a stack
 * that reorders instead of exiting needs none. The card that was flicked
 * fades as it travels back, because anything past the third slot is at
 * opacity 0, so it reads as going under the pile rather than snapping there.
 */
const SWIPE_PX = 70
const VISIBLE = 3 // how many are drawn behind the top one

export default function Stack({
  albums,
  flipped,
  onFlip,
  onOpen,
  t,
  nextLabel,
}: {
  albums: Album[]
  flipped: string | null
  onFlip: (key: string) => void
  onOpen: (entry: Album) => void
  t: React.ComponentProps<typeof PrintCard>['t']
  nextLabel: string
}) {
  const reduce = useReducedMotion()
  const dragged = useRef(false)
  const [order, setOrder] = useState<string[]>(() => albums.map((a) => a.key))
  const next = useCallback(() => setOrder((o) => [...o.slice(1), o[0]]), [])

  const byKey = new Map(albums.map((a) => [a.key, a]))

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-4/5 w-full">
        {order.map((key, idx) => {
          const entry = byKey.get(key)
          if (!entry) return null
          const top = idx === 0
          const behind = idx > 0 && idx <= VISIBLE
          return (
            <motion.div
              key={key}
              // the slot, not the card, is what animates: a flick changes the
              // order and every print walks to where it now belongs
              animate={{
                y: reduce ? 0 : idx * -8,
                scale: reduce ? 1 : 1 - idx * 0.035,
                rotate: reduce ? 0 : (idx % 2 === 0 ? 1 : -1) * idx * 1.2,
                opacity: top || behind ? 1 : 0,
                x: 0,
              }}
              transition={{ duration: reduce ? 0 : 0.4, ease: [0.16, 1, 0.3, 1] }}
              style={{ zIndex: albums.length - idx }}
              drag={top && !reduce ? 'x' : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.5}
              // reset on pointer-down, not drag start: framer withholds
              // onDragStart until the drag threshold is crossed, so a flag
              // reset there stays true after the first real flick and every
              // later tap is swallowed
              onPointerDownCapture={() => {
                dragged.current = false
              }}
              onDrag={(_, info) => {
                if (Math.abs(info.offset.x) > 6) dragged.current = true
              }}
              onDragEnd={(_, info) => {
                if (Math.abs(info.offset.x) > SWIPE_PX) next()
              }}
              aria-hidden={!top}
              className={`absolute inset-0 ${top ? 'cursor-grab active:cursor-grabbing' : 'pointer-events-none'}`}
            >
              {/* only the print on top is reachable; the pile behind it is
                  scenery. `inert` does the whole job in one attribute - not
                  focusable, not clickable, not read out - where aria-hidden
                  alone would still leave the buttons in the tab order. */}
              <div inert={!top}>
                <PrintCard
                  entry={entry}
                  flipped={flipped === entry.key}
                  onFlip={() => {
                    if (dragged.current) return // that was a flick, not a tap
                    onFlip(entry.key)
                  }}
                  onOpen={() => onOpen(entry)}
                  t={t}
                  priority={idx === 0}
                />
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* a flick is a pointer gesture; this is how the pile advances without
          one, and it is the only control a screen reader needs here */}
      <button
        type="button"
        onClick={next}
        className="self-start rounded-full border border-fg/25 px-4 py-1.5 font-mono text-[0.6875rem] uppercase tracking-[0.14em] th:tracking-[0.04em] text-fg-muted transition-colors hover:bg-fg hover:text-bg focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg"
      >
        {nextLabel} →
      </button>
    </div>
  )
}
