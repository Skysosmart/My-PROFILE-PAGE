'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { player } from '@/data/portfolio'

/**
 * Loading screen — shows ONLY the terminal boot text.
 * Types out player.bootLog line by line, then auto-advances into the site
 * (the ASCII hand). No start button, no logo — just the terminal.
 */
export default function BootScreen({ onStart }: { onStart: () => void }) {
  const [lineCount, setLineCount] = useState(0)
  const [done, setDone] = useState(false)
  const timers = useRef<number[]>([])

  const reduce =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  // Reveal boot log lines on a stagger, then auto-continue.
  useEffect(() => {
    if (reduce) {
      setLineCount(player.bootLog.length)
      setDone(true)
      return
    }
    player.bootLog.forEach((_, i) => {
      timers.current.push(
        window.setTimeout(() => setLineCount(i + 1), 380 * (i + 1)),
      )
    })
    timers.current.push(
      window.setTimeout(() => setDone(true), 380 * player.bootLog.length + 400),
    )
    return () => timers.current.forEach(clearTimeout)
  }, [reduce])

  // Once the log finishes, auto-advance to the hand.
  useEffect(() => {
    if (!done) return
    const t = window.setTimeout(onStart, 1000)
    return () => clearTimeout(t)
  }, [done, onStart])

  return (
    <motion.div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-void px-6"
      exit={{ opacity: 0, filter: 'brightness(2.4)' }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-full max-w-2xl">
        <pre className="m-0 whitespace-pre-wrap font-mono text-sm leading-relaxed text-phosphor sm:text-base">
          {player.bootLog.slice(0, lineCount).map((line, i) => (
            <div key={i}>
              <span className="text-phosphor/50">{'>'} </span>
              <span className="txt-glow">{line}</span>
              {i === lineCount - 1 && <span className="animate-blink">▋</span>}
            </div>
          ))}
        </pre>
      </div>
    </motion.div>
  )
}
