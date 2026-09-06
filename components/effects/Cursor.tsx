'use client'

import { useEffect, useState } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react'

/**
 * The custom cursor: a 6 px yellow dot that sits on the pointer and a 28 px
 * ring that follows on a spring. Over anything clickable the ring grows and
 * inverts what is under it; over a text field it steps aside and the native
 * caret cursor comes back. An element can ask for a mode with
 * data-cursor="link|text|none".
 *
 * Desktop pointers only: it never mounts on a touch screen, under
 * prefers-reduced-motion, or while the boot screen is up. The native cursor
 * is hidden only while this one is actually drawn, so nothing is ever
 * without a cursor.
 */
type Mode = 'default' | 'link' | 'text' | 'none'

const CLICKABLE = 'a, button, [role="button"], [role="option"], summary, label, input[type="checkbox"], input[type="radio"], select'
const TEXTY = 'input:not([type="checkbox"]):not([type="radio"]), textarea, [contenteditable="true"]'

export default function Cursor() {
  const reduce = useReducedMotion()
  const [on, setOn] = useState(false)
  const [mode, setMode] = useState<Mode>('default')
  const [down, setDown] = useState(false)
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const rx = useSpring(x, { stiffness: 500, damping: 40, mass: 0.6 })
  const ry = useSpring(y, { stiffness: 500, damping: 40, mass: 0.6 })

  useEffect(() => {
    if (reduce) return
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)')
    if (!mq.matches) return
    setOn(true)
    document.documentElement.dataset.cursor = 'custom'

    const modeFor = (el: Element | null): Mode => {
      const asked = el?.closest<HTMLElement>('[data-cursor]')?.dataset.cursor
      if (asked === 'link' || asked === 'text' || asked === 'none') return asked
      if (el?.closest(TEXTY)) return 'text'
      if (el?.closest(CLICKABLE)) return 'link'
      return 'default'
    }
    const move = (e: PointerEvent) => {
      x.set(e.clientX)
      y.set(e.clientY)
      setMode(modeFor(e.target as Element | null))
    }
    const leave = () => x.set(-100)
    const pressOn = () => setDown(true)
    const pressOff = () => setDown(false)
    window.addEventListener('pointermove', move, { passive: true })
    document.documentElement.addEventListener('pointerleave', leave)
    window.addEventListener('pointerdown', pressOn)
    window.addEventListener('pointerup', pressOff)
    return () => {
      window.removeEventListener('pointermove', move)
      document.documentElement.removeEventListener('pointerleave', leave)
      window.removeEventListener('pointerdown', pressOn)
      window.removeEventListener('pointerup', pressOff)
      delete document.documentElement.dataset.cursor
    }
  }, [reduce, x, y])

  if (!on) return null
  const hidden = mode === 'text' || mode === 'none'
  // in px, scaled by the root font size (the site grows with the viewport)
  const rem = typeof document === 'undefined' ? 1 : parseFloat(getComputedStyle(document.documentElement).fontSize) / 16 || 1
  const ring = (mode === 'link' ? 44 : 28) * rem

  return (
    <>
      {/* the dot: no spring, it is the pointer */}
      <motion.div
        aria-hidden
        style={{ x, y, translateX: '-50%', translateY: '-50%' }}
        className={`pointer-events-none fixed left-0 top-0 z-[90] h-1.5 w-1.5 rounded-full bg-duck transition-opacity duration-150 ${
          hidden ? 'opacity-0' : 'opacity-100'
        }`}
      />
      {/* the ring: lags, grows over links, inverts what it covers */}
      <motion.div
        aria-hidden
        style={{ x: rx, y: ry, translateX: '-50%', translateY: '-50%' }}
        animate={{ width: ring, height: ring, scale: down ? 0.85 : 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className={`pointer-events-none fixed left-0 top-0 z-[89] rounded-full border border-white mix-blend-difference transition-opacity duration-150 ${
          hidden ? 'opacity-0' : mode === 'link' ? 'bg-white/90 opacity-100' : 'opacity-70'
        }`}
      />
    </>
  )
}
