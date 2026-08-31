'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * ASCII image - a project screenshot that first appears as a grid of
 * characters sampled from the image's luminance, holds for a beat, then
 * dissolves into the real photo. Same charset as Ascii3D so the two read as
 * one system.
 *
 * Perf/safety (site conventions):
 *  - Sampling runs once per (src, cols, charset) and is cached module-wide,
 *    so a project shown twice never touches the canvas again.
 *  - prefers-reduced-motion skips sampling; the photo shows from the first
 *    frame via Tailwind's motion-reduce variant (CSS, so no hydration flash).
 *  - A failed load or missing canvas falls back to the photo. The image is
 *    never left hidden.
 *  - Timers and the ResizeObserver are torn down on unmount / src change.
 */

// ---- dials -----------------------------------------------------------------
const CHARSET = ' .:-+*=%@#' // dark → bright (same as Ascii3D)
const CELL_ASPECT = 0.5 // glyph width / height at line-height 1
const GLYPH_W = 0.6 // JetBrains Mono advance width as a share of font-size
// -----------------------------------------------------------------------------

type Frame = { text: string; rows: number }
const cache = new Map<string, Promise<Frame>>() // key: src|cols|charset

/** Downsample the image to cols x rows luminance cells and map to charset. */
function sample(src: string, cols: number, charset: string): Promise<Frame> {
  const key = `${src}|${cols}|${charset}`
  const hit = cache.get(key)
  if (hit) return hit
  const job = (async () => {
    const img = new Image()
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error(`AsciiImage: failed to load ${src}`))
      img.src = src
    })
    const rows = Math.max(1, Math.round(cols * (img.naturalHeight / img.naturalWidth) * CELL_ASPECT))
    const canvas = document.createElement('canvas')
    canvas.width = cols
    canvas.height = rows
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) throw new Error('AsciiImage: no 2d canvas')
    ctx.drawImage(img, 0, 0, cols, rows)
    const { data } = ctx.getImageData(0, 0, cols, rows)
    const lines: string[] = []
    for (let y = 0; y < rows; y++) {
      let line = ''
      for (let x = 0; x < cols; x++) {
        const i = (y * cols + x) * 4
        const lum = (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255
        line += charset[Math.min(charset.length - 1, Math.floor(lum * charset.length))]
      }
      lines.push(line)
    }
    return { text: lines.join('\n'), rows }
  })()
  cache.set(key, job)
  job.catch(() => cache.delete(key)) // leave room for a retry on the next mount
  return job
}

type Props = {
  src: string
  alt: string
  className?: string
  cols?: number
  charset?: string
  holdMs?: number
  durationMs?: number
}

export default function AsciiImage({
  src,
  alt,
  className = '',
  cols = 96,
  charset = CHARSET,
  holdMs = 350,
  durationMs = 600,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [frame, setFrame] = useState<Frame | null>(null)
  const [revealed, setRevealed] = useState(false) // photo in, ASCII out
  const [box, setBox] = useState({ w: 0, h: 0 }) // wrapper size in px

  // Reset DURING render when src changes, not in an effect: an effect runs
  // after the commit paints, so the incoming photo would show at full opacity
  // for one frame before its ASCII develop starts.
  const [shownSrc, setShownSrc] = useState(src)
  if (shownSrc !== src) {
    setShownSrc(src)
    setFrame(null)
    setRevealed(false)
  }

  // Sample (or hit the cache), hold the ASCII frame, then dissolve.
  // Any failure reveals the photo straight away.
  useEffect(() => {
    let cancelled = false
    let timer = 0
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setRevealed(true)
      return
    }
    sample(src, cols, charset)
      .then((f) => {
        if (cancelled) return
        setFrame(f)
        timer = window.setTimeout(() => setRevealed(true), holdMs)
      })
      .catch(() => !cancelled && setRevealed(true))
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [src, cols, charset, holdMs])

  // Track the wrapper so the glyph grid can be scaled to fill it exactly.
  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(([e]) => setBox({ w: e.contentRect.width, h: e.contentRect.height }))
    ro.observe(wrap)
    return () => ro.disconnect()
  }, [])

  // Snap (no transition) when resetting to the ASCII state, ease when revealing.
  const fade = { transitionDuration: revealed ? `${durationMs}ms` : '0ms' }

  return (
    <div ref={wrapRef} className={`relative overflow-hidden ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        draggable={false}
        className={`absolute inset-0 h-full w-full object-cover object-top transition-opacity motion-reduce:opacity-100 motion-reduce:transition-none ${revealed ? 'opacity-100' : 'opacity-0'}`}
        style={fade}
      />
      <pre
        aria-hidden
        className={`pointer-events-none absolute inset-0 m-0 select-none overflow-hidden whitespace-pre font-mono leading-none text-fg/90 transition-opacity motion-reduce:hidden ${revealed ? 'opacity-0' : 'opacity-100'}`}
        style={{
          ...fade,
          fontSize: box.w ? `${box.w / cols / GLYPH_W}px` : undefined,
          lineHeight: frame && box.h ? `${box.h / frame.rows}px` : undefined,
        }}
      >
        {frame?.text}
      </pre>
    </div>
  )
}
