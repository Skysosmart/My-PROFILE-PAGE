'use client'

import { useEffect, useRef } from 'react'
import { assets } from '@/data/portfolio'

/**
 * Background layer of the Hand ASCII art that "generates" itself once.
 * Random glyphs scramble and resolve, row by row, into the hand shape, then
 * hold static (no loop). The art is scaled with a CSS transform so it always
 * COVERS its parent section, and rescales on resize.
 *
 * Rendered as an absolute layer INSIDE the hero section (not fixed), so it
 * scrolls up and away together with the hero when the next sections slide up.
 * The ~9k-cell art is animated by writing straight to a <pre> via a ref in one
 * requestAnimationFrame loop that stops once materializing finishes.
 * Honors prefers-reduced-motion.
 */

const NOISE = '01+x$X;/\\|=<>*'.split('')
const MATERIALIZE = 4200 // ms for the one-time generate
const BAND = 0.08 // width of the scrambling frontier

export default function HandBackground() {
  const preRef = useRef<HTMLPreElement>(null)
  const hostRef = useRef<HTMLDivElement>(null)

  // Scale the <pre> so the hand covers the host section; recompute on resize.
  //
  // The art is two hands side by side, about 3:1. Covering a portrait phone
  // with a 3:1 piece means scaling to the height, which makes it four screens
  // wide and leaves only the empty middle in view - fingertips at the edges
  // and nothing else. So when the host is narrower than the art, turn the art
  // 90 degrees first: the two hands become a tall pair reaching toward each
  // other, and cover-scaling the rotated box fits the phone almost exactly.
  const fit = () => {
    const pre = preRef.current
    const host = hostRef.current
    if (!pre || !host) return
    pre.style.transform = 'none' // reset to measure natural size
    const natW = pre.scrollWidth
    const natH = pre.scrollHeight
    if (!natW || !natH) return
    const hostW = host.clientWidth
    const hostH = host.clientHeight
    // the share of the art left on screen after cover-scaling, each way up;
    // take whichever orientation wastes less of the drawing
    const cover = (w: number, h: number) => Math.max(hostW / w, hostH / h)
    const share = (w: number, h: number) => (hostW * hostH) / (w * h * cover(w, h) ** 2)
    const turn = share(natH, natW) > share(natW, natH)
    const k = turn ? cover(natH, natW) : cover(natW, natH)
    pre.style.transform = `${turn ? 'rotate(90deg) ' : ''}scale(${k})`
  }

  useEffect(() => {
    let raf = 0
    let cancelled = false
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

    fetch(assets.handText)
      .then((r) => (r.ok ? r.text() : ''))
      .then((text) => {
        if (cancelled || !preRef.current) return
        const rows = text.replace(/\r/g, '').split('\n')
        const H = rows.length
        const width = Math.max(...rows.map((r) => r.length))
        // Pad every row to a constant width so the block size never changes.
        const padded = rows.map((r) => r.padEnd(width, ' '))
        const cols = padded.map((r) => r.length)
        const finalArt = padded.join('\n')

        // The art holds TWO hands: the upper one (top rows) and the lower one
        // (bottom rows). They generate at the SAME time but in OPPOSITE
        // directions - the top hand sweeps left→right, the bottom hand sweeps
        // right→left. Per-cell reveal threshold encodes that.
        const half = H / 2
        const maxX = Math.max(1, width - 1)
        const thresh = padded.map((row, y) =>
          Array.from(row, (_, x) => {
            const nx = x / maxX
            const base = y < half ? nx : 1 - nx // top: L→R, bottom: R→L
            return base * 0.8 + Math.random() * 0.2
          }),
        )

        // Paint once so the <pre> has its (constant) natural size, then fit.
        preRef.current.textContent = finalArt
        fit()
        window.addEventListener('resize', fit)

        if (reduce) return

        const t0 = performance.now()
        let frame = 0
        const render = (now: number) => {
          if (cancelled || !preRef.current) return
          frame++
          const t = now - t0
          if (t >= MATERIALIZE) {
            preRef.current.textContent = finalArt // settle & stop (plays once)
            return
          }
          const p = t / MATERIALIZE
          let out = ''
          for (let y = 0; y < H; y++) {
            const row = padded[y]
            const th = thresh[y]
            for (let x = 0; x < cols[y]; x++) {
              const ch = row[x]
              if (ch === ' ') {
                out += ' '
                continue
              }
              const d = p - th[x]
              if (d >= BAND) out += ch
              else if (d >= -BAND)
                out += (frame & 1) === 0 ? NOISE[(Math.random() * NOISE.length) | 0] : ch
              else out += ' '
            }
            out += '\n'
          }
          preRef.current.textContent = out
          raf = requestAnimationFrame(render)
        }
        raf = requestAnimationFrame(render)
      })
      .catch(() => {})

    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', fit)
    }
  }, [])

  return (
    <div
      ref={hostRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center overflow-hidden"
    >
      <pre
        ref={preRef}
        className="m-0 origin-center whitespace-pre font-mono text-[10px] leading-none text-white/[0.5] [text-shadow:0_0_8px_rgba(255,255,255,0.3)] max-md:text-white/[0.32]"
      />
    </div>
  )
}
