'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Types out `text` one character at a time once it scrolls into view.
 * - speed: ms per character
 * - startDelay: ms before typing begins
 * - onDone: fires when complete
 * Respects prefers-reduced-motion (shows full text instantly).
 */
export default function TypeWriter({
  text,
  speed = 26,
  startDelay = 0,
  className = '',
  caret = true,
  onDone,
}: {
  text: string
  speed?: number
  startDelay?: number
  className?: string
  caret?: boolean
  onDone?: () => void
}) {
  const [out, setOut] = useState('')
  const [done, setDone] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

    const run = () => {
      if (started.current) return
      started.current = true
      if (reduce) {
        setOut(text)
        setDone(true)
        onDone?.()
        return
      }
      let i = 0
      const tick = () => {
        i += 1
        setOut(text.slice(0, i))
        if (i < text.length) {
          timer = window.setTimeout(tick, speed)
        } else {
          setDone(true)
          onDone?.()
        }
      }
      let timer = window.setTimeout(tick, startDelay)
    }

    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && run()),
      { threshold: 0.25 },
    )
    io.observe(node)
    return () => io.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text])

  return (
    <span ref={ref} className={className}>
      {out}
      {caret && !done && <span className="animate-blink text-phosphor">▋</span>}
    </span>
  )
}
