'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { player } from '@/data/portfolio'

/**
 * Loading screen - shows ONLY the terminal boot text.
 * Types out player.bootLog line by line, then fades itself out and hands over.
 *
 * The fade is driven by this component's own state rather than AnimatePresence's
 * exit: relying on exit left the overlay stranded at full opacity over an
 * already-rendered site, so the only way past it was to click. Now the element
 * animates to opacity 0 first and only then unmounts, with a timer behind the
 * animation callback so a dropped callback can never strand it again.
 *
 * Click or any key skips ahead.
 */
export default function BootScreen({ onStart }: { onStart: () => void }) {
  const [lineCount, setLineCount] = useState(0)
  const [leaving, setLeaving] = useState(false)
  const timers = useRef<number[]>([])
  const handedOver = useRef(false)

  const finish = useCallback(() => {
    if (handedOver.current) return
    handedOver.current = true
    onStart()
  }, [onStart])

  const skip = useCallback(() => {
    setLineCount(player.bootLog.length)
    setLeaving(true)
  }, [])

  // Reveal the log on a stagger, then begin leaving.
  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      setLineCount(player.bootLog.length)
      finish()
      return
    }
    const t = timers.current
    player.bootLog.forEach((_, i) => {
      t.push(window.setTimeout(() => setLineCount(i + 1), 380 * (i + 1)))
    })
    t.push(window.setTimeout(() => setLeaving(true), 380 * player.bootLog.length + 600))
    return () => t.forEach(clearTimeout)
  }, [finish])

  // Safety net: hand over even if onAnimationComplete never arrives.
  useEffect(() => {
    if (!leaving) return
    const t = window.setTimeout(finish, 900)
    return () => clearTimeout(t)
  }, [leaving, finish])

  // Any key skips.
  useEffect(() => {
    window.addEventListener('keydown', skip)
    return () => window.removeEventListener('keydown', skip)
  }, [skip])

  return (
    <motion.div
      onClick={skip}
      initial={{ opacity: 1 }}
      animate={{ opacity: leaving ? 0 : 1 }}
      transition={{ duration: 0.5 }}
      onAnimationComplete={() => leaving && finish()}
      className="fixed inset-0 z-[80] flex cursor-pointer items-center justify-center bg-void px-6"
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
