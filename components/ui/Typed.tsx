'use client'

import { useEffect, useState } from 'react'
import { useReducedMotion } from 'motion/react'

/**
 * Text that types itself in, glyph by glyph, once `on` (and after `delay`
 * ms). The whole text sits in its box from the start, invisible, so nothing
 * around it moves while it types and a screen reader gets the whole line;
 * the typed part is drawn over it. Same clock as TerminalLog: the count
 * follows elapsed time, so a busy main thread skips glyphs instead of
 * stretching the line. Reduced motion prints it whole.
 */
export default function Typed({
  text,
  on,
  delay = 0,
  speed = 20,
  caret = true,
  className = '',
}: {
  text: string
  /** start (the label has scrolled into view) */
  on: boolean
  /** ms after `on` before the first glyph */
  delay?: number
  /** ms per glyph */
  speed?: number
  caret?: boolean
  className?: string
}) {
  const reduce = useReducedMotion()
  const [n, setN] = useState(0)

  useEffect(() => {
    if (!on || reduce) return
    const t0 = performance.now() + delay
    let timer = 0
    const tick = () => {
      const k = Math.min(text.length, Math.max(0, Math.floor((performance.now() - t0) / speed) + 1))
      setN(k)
      if (k < text.length) timer = window.setTimeout(tick, speed)
    }
    timer = window.setTimeout(tick, Math.max(0, delay))
    return () => window.clearTimeout(timer)
  }, [on, reduce, text, delay, speed])

  const shown = reduce ? text.length : n
  const done = shown >= text.length
  return (
    // inline-block, so a line that wraps wraps the same way underneath and on top
    <span className={`relative inline-block max-w-full align-top ${className}`}>
      <span className={done ? undefined : 'opacity-0'}>{text}</span>
      {!done && (
        <span aria-hidden className="absolute inset-0">
          {text.slice(0, shown)}
          {caret && shown > 0 && <span className="text-duck">▋</span>}
        </span>
      )}
    </span>
  )
}
