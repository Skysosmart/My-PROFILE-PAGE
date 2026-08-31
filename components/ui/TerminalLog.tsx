'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Types out an array of terminal lines sequentially once scrolled into view.
 * Each line may have a `prompt` (shown dim before the text, e.g. "$"), a
 * colored `prefix` (e.g. red "[SYSTEM]"), a body `className` for colored text,
 * and a `muted` flag (dimmer text). Reduced-motion prints instantly.
 */
export type Line = {
  prompt?: string
  prefix?: { text: string; className?: string }
  text: string
  className?: string
  muted?: boolean
  /** Print the whole line at once. Command OUTPUT is dumped, not typed. */
  instant?: boolean
}

export default function TerminalLog({
  lines,
  speed = 14,
  linePause = 240,
  className = '',
  onDone,
  endCaret = true,
}: {
  lines: Line[]
  speed?: number // ms per character
  linePause?: number // ms between lines
  className?: string
  onDone?: () => void // fires once when all lines have finished typing
  endCaret?: boolean // show a blinking caret at the end when finished
}) {
  // How many lines are fully/partially revealed, and the char count of the active line.
  const [count, setCount] = useState(0) // completed lines
  const [chars, setChars] = useState(0) // chars typed of the current line
  const [done, setDone] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const started = useRef(false)
  const timers = useRef<number[]>([])

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

    const run = () => {
      if (started.current) return
      started.current = true

      if (reduce) {
        setCount(lines.length)
        setDone(true)
        onDone?.()
        return
      }

      const typeLine = (li: number) => {
        if (li >= lines.length) {
          setDone(true)
          onDone?.()
          return
        }
        setChars(0)
        const text = lines[li].text
        // output arrives in one go, then the next line follows quickly: a
        // 237-character paragraph typed at 8ms a character was two seconds
        // of watching a cursor crawl
        if (lines[li].instant) {
          setChars(text.length)
          setCount(li + 1)
          timers.current.push(window.setTimeout(() => typeLine(li + 1), Math.round(linePause / 2)))
          return
        }
        // Reveal by elapsed time, not one character per timer: a timer only
        // fires when the main thread is free, and with a WebGL effect drawing
        // beside this a 8ms timer was landing every 45ms - 120 characters took
        // six seconds. Now a late tick reveals however many characters are
        // due, and a line always finishes in speed x length.
        const start = performance.now()
        const tick = () => {
          const c = Math.min(text.length, Math.floor((performance.now() - start) / speed) + 1)
          setChars(c)
          if (c < text.length) {
            timers.current.push(window.setTimeout(tick, speed))
          } else {
            setCount(li + 1)
            timers.current.push(window.setTimeout(() => typeLine(li + 1), linePause))
          }
        }
        if (text.length === 0) {
          setCount(li + 1)
          timers.current.push(window.setTimeout(() => typeLine(li + 1), linePause))
        } else {
          timers.current.push(window.setTimeout(tick, 40))
        }
      }
      typeLine(0)
    }

    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && run()),
      { threshold: 0.2 },
    )
    io.observe(node)
    return () => {
      io.disconnect()
      timers.current.forEach(clearTimeout)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div ref={ref} className={`font-mono ${className}`}>
      {lines.map((line, i) => {
        if (i > count) return null // not reached yet
        const full = i < count
        const text = full ? line.text : line.text.slice(0, chars)
        const isActive = i === count && !done
        const isLast = i === lines.length - 1
        const bodyClass = line.className ?? (line.muted ? 'text-fg-muted' : 'text-fg/90')
        return (
          <div key={i} className="whitespace-pre-wrap leading-relaxed">
            {line.prompt && <span className="mr-2 text-fg-dim">{line.prompt}</span>}
            {line.prefix && (
              <span className={line.prefix.className ?? 'text-fg-dim'}>{line.prefix.text}</span>
            )}
            <span className={bodyClass}>{text}</span>
            {isActive && <span className="animate-blink text-fg">▋</span>}
            {isLast && done && endCaret && <span className="animate-blink text-fg"> ▋</span>}
          </div>
        )
      })}
    </div>
  )
}
