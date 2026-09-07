'use client'

import { useEffect } from 'react'
import { useReducedMotion } from 'motion/react'
import { startSmoothScroll } from '@/lib/smooth-scroll'
// the package's own rules: html/body height, overscroll containment on the
// [data-lenis-prevent] scrollers, and iframes kept from eating the wheel.
// All of them are scoped to the .lenis class, so reduced motion - which
// never instantiates it - is untouched.
import 'lenis/dist/lenis.css'

/**
 * Mounts the page's inertia (lib/smooth-scroll.ts). Reduced motion never
 * starts it, so the page scrolls exactly as the browser would.
 */
export default function SmoothScroll() {
  const reduce = useReducedMotion()
  useEffect(() => {
    if (reduce) return
    return startSmoothScroll()
  }, [reduce])
  return null
}
