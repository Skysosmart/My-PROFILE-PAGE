'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { player, nav } from '@/data/portfolio'

/**
 * Floating "liquid glass" header bar.
 * A frosted, translucent pill that refracts the ASCII hand behind it (via the
 * inline SVG turbulence/displacement filter below), with a glossy top edge and
 * a slow specular sheen. Monochrome to match the black & white theme.
 *
 * Contents: brand handle · nav links (About / Certificates / Projects /
 * Contact) · live clock. On mobile the nav collapses into a menu button.
 */
export default function Header() {
  const [time, setTime] = useState('')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const tick = () =>
      setTime(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    tick()
    const id = window.setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  const go = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setOpen(false)
  }

  return (
    <>
      {/* SVG filter that displaces the backdrop -> the "liquid" refraction. */}
      <svg aria-hidden width="0" height="0" style={{ position: 'absolute', pointerEvents: 'none' }}>
        <filter id="liquid-glass" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.011 0.014" numOctaves={2} seed={12} result="noise" />
          <feGaussianBlur in="noise" stdDeviation="1.1" result="soft" />
          <feDisplacementMap in="SourceGraphic" in2="soft" scale="22" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>

      <motion.header
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        className="pointer-events-none fixed inset-x-0 top-0 z-[70] flex justify-center px-4 pt-4 sm:pt-5"
      >
        <div className="liquid-glass pointer-events-auto flex w-full max-w-3xl items-center gap-3 rounded-full px-4 py-2 font-mono text-white sm:gap-5 sm:px-6 sm:py-2.5">
          {/* status dot + brand */}
          <button onClick={() => go('about')} className="flex shrink-0 items-center gap-2.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-white shadow-glow-sm" />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-[0.22em] sm:text-xs">
              {player.handle}
            </span>
          </button>

          {/* desktop nav (centered) */}
          <nav className="mx-auto hidden items-center gap-5 md:flex">
            {nav.map((n) => (
              <button
                key={n.id}
                onClick={() => go(n.id)}
                className="nav-link font-mono text-[11px] uppercase tracking-widest"
              >
                {n.label}
              </button>
            ))}
          </nav>

          {/* clock (desktop, right) */}
          <span className="hidden shrink-0 tabular-nums text-[11px] tracking-widest text-white/70 md:inline">
            {time || '--:--:--'}
          </span>

          {/* mobile menu button (right) */}
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={open}
            className="ml-auto rounded border border-white/25 px-2.5 py-1 text-[11px] tracking-widest text-white md:hidden"
          >
            {open ? 'X' : '≡'}
          </button>
        </div>
      </motion.header>

      {/* mobile dropdown */}
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed inset-x-0 top-[68px] z-[69] flex justify-center px-4 md:hidden"
        >
          <div className="glass-panel pointer-events-auto flex w-full max-w-3xl flex-col gap-1 rounded-2xl p-3">
            {nav.map((n) => (
              <button
                key={n.id}
                onClick={() => go(n.id)}
                className="rounded-lg px-3 py-2.5 text-left font-mono text-sm uppercase tracking-widest text-white/80 hover:bg-white/10 hover:text-white"
              >
                {n.label}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </>
  )
}
