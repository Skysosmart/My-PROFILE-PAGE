'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react'

/**
 * The cursor label, the way lamalama.com does it: the native cursor stays,
 * and a small monospace tag rides just beside it, hidden at rest, that
 * appears over anything you can act on and says what will happen. The text
 * reveals glyph by glyph, the way the boot screen's hand does.
 *
 * What an element says comes from the nearest `data-cursor-label`; a link
 * without one says OPEN (with an arrow when it leaves the site), anything
 * else says nothing. Desktop pointers only: it never mounts on a touch
 * screen or under prefers-reduced-motion.
 */
const NOISE = '01+x$X;/\\|=<>*'
const REVEAL_MS = 260

function labelFor(el: Element | null): string {
  const asked = el?.closest<HTMLElement>('[data-cursor-label]')
  if (asked) return asked.dataset.cursorLabel ?? ''
  const a = el?.closest<HTMLAnchorElement>('a[href]')
  if (a) return a.target === '_blank' || /^https?:/.test(a.getAttribute('href') ?? '') ? 'open ↗' : 'open'
  return ''
}

export default function Cursor() {
  const reduce = useReducedMotion()
  const [on, setOn] = useState(false)
  const [label, setLabel] = useState('')
  const [shown, setShown] = useState('')
  const x = useMotionValue(-200)
  const y = useMotionValue(-200)
  // a light lag, so the tag trails the pointer instead of being glued to it
  const sx = useSpring(x, { stiffness: 900, damping: 60, mass: 0.5 })
  const sy = useSpring(y, { stiffness: 900, damping: 60, mass: 0.5 })
  const raf = useRef(0)

  useEffect(() => {
    if (reduce) return
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    setOn(true)
    const move = (e: PointerEvent) => {
      x.set(e.clientX)
      y.set(e.clientY)
      setLabel(labelFor(e.target as Element | null))
    }
    const leave = () => setLabel('')
    window.addEventListener('pointermove', move, { passive: true })
    document.documentElement.addEventListener('pointerleave', leave)
    window.addEventListener('blur', leave)
    return () => {
      window.removeEventListener('pointermove', move)
      document.documentElement.removeEventListener('pointerleave', leave)
      window.removeEventListener('blur', leave)
    }
  }, [reduce, x, y])

  // reveal: each glyph settles left to right, scrambling until it does
  useEffect(() => {
    cancelAnimationFrame(raf.current)
    if (!label) {
      setShown('')
      return
    }
    const text = label.toUpperCase()
    const t0 = performance.now()
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / REVEAL_MS)
      const settled = Math.floor(p * text.length)
      let out = ''
      for (let i = 0; i < text.length; i++) {
        const ch = text[i]
        if (i < settled || ch === ' ') out += ch
        else out += NOISE[(Math.random() * NOISE.length) | 0]
      }
      setShown(out)
      if (p < 1) raf.current = requestAnimationFrame(tick)
      else setShown(text)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [label])

  if (!on) return null
  return (
    <motion.div
      aria-hidden
      style={{ x: sx, y: sy }}
      className="pointer-events-none fixed left-0 top-0 z-[90]"
    >
      <span
        className={`ml-4 mt-5 flex h-[1.375rem] items-center bg-fg px-2 font-mono text-[0.625rem] font-medium uppercase tracking-[0.12em] text-bg transition-opacity duration-150 ${
          label ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <span className="mr-1.5 text-duck">▸</span>
        {shown || ' '}
      </span>
    </motion.div>
  )
}
