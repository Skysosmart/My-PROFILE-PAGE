'use client'

import { useEffect, useRef } from 'react'
import { assets } from '@/data/portfolio'

/**
 * Section-scoped background of the "Sky" ASCII logo (Sky-ASCII.txt), scaled to
 * COVER its parent section as a faint watermark. Rendered absolute (not fixed),
 * so it scrolls up and away together with its section - same pattern as the
 * hand in the hero.
 */
export default function SkyBackground() {
  const preRef = useRef<HTMLPreElement>(null)
  const hostRef = useRef<HTMLDivElement>(null)

  // Scale the <pre> so the logo covers the host section; recompute on resize.
  const fit = () => {
    const pre = preRef.current
    const host = hostRef.current
    if (!pre || !host) return
    pre.style.transform = 'none'
    const natW = pre.scrollWidth
    const natH = pre.scrollHeight
    if (!natW || !natH) return
    const k = Math.max(host.clientWidth / natW, host.clientHeight / natH)
    pre.style.transform = `scale(${k})`
  }

  useEffect(() => {
    let alive = true
    fetch(assets.skyLogoText)
      .then((r) => (r.ok ? r.text() : ''))
      .then((t) => {
        if (!alive || !preRef.current || !t) return
        preRef.current.textContent = t.replace(/\r/g, '')
        fit()
        window.addEventListener('resize', fit)
      })
      .catch(() => {})
    return () => {
      alive = false
      window.removeEventListener('resize', fit)
    }
  }, [])

  return (
    <div
      ref={hostRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center overflow-hidden"
    >
      <pre
        ref={preRef}
        className="m-0 origin-center whitespace-pre font-mono text-[10px] leading-none text-fg/[0.14] [text-shadow:0_0_10px_rgb(var(--fg)_/_0.2)]"
      />
    </div>
  )
}
