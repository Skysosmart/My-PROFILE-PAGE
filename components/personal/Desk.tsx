'use client'

import { useCallback, useRef, useState, useSyncExternalStore } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import Duck from '@/components/duck/Duck'
import PrintCard, { type Album } from '@/components/personal/PrintCard'

/**
 * The prints, dropped on the desk. `lg` and up only - a scatter needs room,
 * and the phone gets <Stack/> instead.
 *
 * Placement is a jittered grid, not a random pile. Pure randomness at
 * thirteen cards either clumps or walks off the edge, and it has to be
 * solved every resize; a five-by-three grid with the cells nudged gives the
 * same "tossed down" read and can be proved to stay inside the box. The
 * numbers below are the proof: a card is 22% wide, the rightmost column
 * starts at 76%, and the jitter is capped at 2%, so the furthest right edge
 * any print can reach is exactly 100%.
 *
 * The jitter is derived from the album key, never Math.random(): the desk
 * must lay out the same way on every render, or a re-render reshuffles the
 * pile under the reader's hand.
 *
 * Thirteen prints into fifteen cells leaves the bottom two corners empty,
 * which is where the duck sleeps.
 */
const COLS = [0, 19, 38, 57, 76] // left %, card is 22% wide
const ROWS = [0, 32, 63] // top %, card is ~34% of the desk's height

/* the same pointer test Cursor.tsx uses, so "has a real pointer" means one
   thing across the site */
const FINE = '(hover: hover) and (pointer: fine)'
let fineMql: MediaQueryList | null = null
const fineQuery = () => (fineMql ??= window.matchMedia(FINE))
const subscribeFine = (cb: () => void) => {
  const m = fineQuery()
  m.addEventListener('change', cb)
  return () => m.removeEventListener('change', cb)
}
const isFine = () => fineQuery().matches

/** a small deterministic hash: same key, same number, every time, everywhere */
function hash(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0) / 4294967295
}

/** three independent draws from one key, so x, y and angle do not correlate */
function place(key: string, i: number) {
  const a = hash(key)
  const b = hash(`${key}·y`)
  const c = hash(`${key}·r`)
  return {
    left: COLS[i % COLS.length] + (a * 4 - 2),
    top: ROWS[Math.floor(i / COLS.length)] + (b * 4 - 2),
    // under six degrees. Past that a print stops looking dropped and starts
    // looking broken - the same limit the ink hand keeps on its wobble.
    rotate: c * 11 - 5.5,
  }
}

export default function Desk({
  albums,
  flipped,
  onFlip,
  onOpen,
  t,
}: {
  albums: Album[]
  flipped: string | null
  onFlip: (key: string) => void
  onOpen: (entry: Album) => void
  t: React.ComponentProps<typeof PrintCard>['t']
}) {
  const reduce = useReducedMotion()
  const desk = useRef<HTMLDivElement>(null)
  // One card drags at a time, so one flag is enough: a drag must never land
  // as a click on the print.
  //
  // It is reset on pointer-down, NOT on drag start - and that is the whole
  // point. The carousel this replaced reset it in onDragStart, but framer
  // does not fire onDragStart until the drag threshold is crossed, so after
  // one real drag the flag stayed true and a plain click never opened an
  // album again for the rest of the session. Pointer-down is the only moment
  // the flag is reliably fresh.
  const dragged = useRef(false)

  // Two-axis drag captures vertical pans, so on a touch screen it would take
  // the page's scroll away under the finger. There is no framer setting that
  // gives you both - dragDirectionLock just drags the card vertically
  // instead. So the desk is scattered and tappable everywhere, and only a
  // real pointer may pick a print up. This matters on an iPad, which
  // lib/viewport.ts pins to a 1024 viewport: it lands on the desk, with a
  // coarse pointer.
  const fine = useSyncExternalStore(subscribeFine, isFine, () => false)
  const [order, setOrder] = useState<string[]>(() => albums.map((a) => a.key))
  const raise = useCallback((key: string) => setOrder((o) => [...o.filter((k) => k !== key), key]), [])

  // Reduced motion gets the same thirteen prints laid out flat: no scatter,
  // no tilt, no drag. The scatter is the decoration; the photographs and
  // what is written on the back are the message, and they are all still here.
  if (reduce) {
    return (
      <ul className="grid grid-cols-3 gap-5 xl:grid-cols-4">
        {albums.map((entry) => (
          <li key={entry.key}>
            <PrintCard
              entry={entry}
              flipped={flipped === entry.key}
              onFlip={() => onFlip(entry.key)}
              onOpen={() => onOpen(entry)}
              t={t}
            />
          </li>
        ))}
      </ul>
    )
  }

  return (
    <div ref={desk} className="relative aspect-5/4 w-full">
      <ul className="absolute inset-0">
        {albums.map((entry, i) => {
          const { left, top, rotate } = place(entry.key, i)
          const z = order.indexOf(entry.key) + 1
          return (
            // DOM order stays album order so Tab is predictable; only the
            // paint order moves when a print is picked up
            <motion.li
              key={entry.key}
              variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={{ left: `${left}%`, top: `${top}%`, zIndex: z }}
              className="absolute w-[22%]"
            >
              {/* drag lives on its own element and writes x/y; the wrapper
                  above animates opacity and y for the reveal, so the two
                  never write the same transform. rotate is safe here because
                  drag does not touch it. */}
              <motion.div
                drag={fine}
                dragConstraints={desk}
                dragMomentum={false}
                dragElastic={0.06}
                onPointerDownCapture={() => {
                  dragged.current = false
                  raise(entry.key)
                }}
                onDrag={(_, info) => {
                  if (Math.hypot(info.offset.x, info.offset.y) > 6) dragged.current = true
                }}
                whileDrag={{ scale: 1.03 }}
                initial={{ rotate }}
                // a turned print straightens and comes closer, because the
                // back is text and 22% of the desk is not enough to read a
                // sentence on - least of all a Thai one, whose line box is
                // taller for the same size
                // no zIndex here: raise() already put this print's <li> at the
                // top of the order on pointer-down, and a second stacking
                // context inside it would only be a place for the next person
                // to look when the pile paints wrong
                animate={{
                  rotate: flipped === entry.key ? 0 : rotate,
                  scale: flipped === entry.key ? 1.3 : 1,
                }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className={`${fine ? 'cursor-grab active:cursor-grabbing' : ''} relative`}
              >
                <PrintCard
                  entry={entry}
                  flipped={flipped === entry.key}
                  onFlip={() => {
                    if (dragged.current) return // that was a drag, not a press
                    raise(entry.key)
                    onFlip(entry.key)
                  }}
                  onOpen={() => onOpen(entry)}
                  t={t}
                  priority={i < 3}
                />
              </motion.div>
            </motion.li>
          )
        })}
      </ul>

      {/* the two cells the prints do not fill. He is not content - he is
          aria-hidden inside Duck - so an empty corner is exactly where he
          belongs */}
      {/* No width on the wrapper: Duck sets its own in rem inline, which beats
          a class, so a w-[20%] here only ever anchored it - and anchored it
          badly, since the drawing then overflowed the box to the right and off
          the desk. Pinned bottom-right and left to shrink-wrap, it grows up
          and to the left into the two cells the prints do not fill. */}
      <div className="pointer-events-none absolute bottom-[1%] right-[1%]">
        <Duck pose="sleep" width={380} parallax={6} />
      </div>
    </div>
  )
}
