'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

/**
 * Mounts its children only once the reader is near them.
 *
 * The whole site used to mount the instant the boot screen ended: the About
 * terminal and its three.js torus, fifty-six certificate thumbnails and their
 * marquee, the Projects film - all at once, all off screen. On a phone that is
 * the stutter you feel right after boot. Now each section is a viewport-tall
 * placeholder until it is `margin` away, then it mounts and does its work.
 *
 * The placeholder carries the section's id so the nav's scrollIntoView still
 * has something to land on; landing there is what mounts the real section.
 */
export default function Deferred({
  id,
  children,
  margin = '400px',
  minHeight = '100svh',
}: {
  id?: string
  children: ReactNode
  /** how far ahead of the viewport to mount, as a CSS length */
  margin?: string
  minHeight?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [on, setOn] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || on) return
    if (typeof IntersectionObserver === 'undefined') {
      setOn(true)
      return
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setOn(true)
          io.disconnect()
        }
      },
      { rootMargin: `${margin} 0px` },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [on, margin])

  return on ? <>{children}</> : <div ref={ref} id={id} aria-hidden style={{ minHeight }} />
}
