'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, type PanInfo } from 'framer-motion'
import GlassSection from '@/components/ui/GlassSection'
import { certificates, assets, type Certificate } from '@/data/portfolio'

const src = (file: string) => assets.certDir + encodeURIComponent(file)

/** Small card used in the "view all" grid. */
function GridCard({ c, onOpen }: { c: Certificate; onOpen: (c: Certificate) => void }) {
  return (
    <button
      onClick={() => onOpen(c)}
      className="group relative overflow-hidden rounded-lg border border-white/12 bg-white/[0.02] text-left transition-colors hover:border-white/40"
    >
      <div className="aspect-[4/3] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src(c.file)}
          alt={c.title}
          loading="lazy"
          className="h-full w-full object-cover grayscale transition-all duration-500 group-hover:scale-105 group-hover:grayscale-0"
        />
      </div>
      <div className="border-t border-white/10 px-3 py-2 font-mono">
        <p className="truncate text-xs font-bold text-white">{c.title}</p>
        {c.issuer && <p className="truncate text-[10px] uppercase tracking-wider text-white/45">{c.issuer}</p>}
      </div>
    </button>
  )
}

/** CERTIFICATES — draggable featured deck + "view all" grid + lightbox. */
export default function Certificates() {
  const [showAll, setShowAll] = useState(false)
  const [active, setActive] = useState<Certificate | null>(null)
  const [mounted, setMounted] = useState(false)
  const [index, setIndex] = useState(0)

  const featured = certificates.filter((c) => c.featured)
  const n = featured.length

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!active) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setActive(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active])

  const next = () => setIndex((i) => (i + 1) % n)
  const prev = () => setIndex((i) => (i - 1 + n) % n)

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -90 || info.velocity.x < -500) next()
    else if (info.offset.x > 90 || info.velocity.x > 500) prev()
  }

  // Lightbox portaled to <body> so it escapes the section transform.
  const lightbox = (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setActive(null)}
          className="fixed inset-0 z-[95] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.94, opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[88vh] max-w-4xl overflow-hidden rounded-xl border border-white/20 bg-black"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src(active.file)} alt={active.title} className="max-h-[80vh] w-auto object-contain" />
            <div className="flex items-center justify-between gap-4 border-t border-white/15 bg-black px-4 py-3 font-mono">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-white">{active.title}</p>
                {active.issuer && (
                  <p className="truncate text-[11px] uppercase tracking-wider text-white/50">{active.issuer}</p>
                )}
              </div>
              <button
                onClick={() => setActive(null)}
                aria-label="Close"
                className="shrink-0 rounded border border-white/30 px-3 py-1 text-xs text-white hover:bg-white hover:text-black"
              >
                [ X ]
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  return (
    <GlassSection id="certificates" index="02" title="Certificates" variant="flip">
      <p className="mb-6 font-mono text-xs text-white/50">
        {certificates.length} certificates · drag the card or use ← → · click to enlarge
      </p>

      {/* Draggable deck of featured certs */}
      <div className="relative mx-auto h-[340px] w-full max-w-sm select-none sm:h-[380px]">
        {featured.map((c, i) => {
          const rel = (i - index + n) % n
          if (rel > 2) return null
          const top = rel === 0
          return (
            <motion.div
              key={c.file}
              drag={top ? 'x' : false}
              dragSnapToOrigin
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.7}
              onDragEnd={top ? onDragEnd : undefined}
              onTap={top ? () => setActive(c) : undefined}
              animate={{ y: rel * 14, scale: 1 - rel * 0.05, opacity: rel === 2 ? 0.5 : 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{ zIndex: n - rel, cursor: top ? 'grab' : 'default' }}
              whileTap={top ? { cursor: 'grabbing' } : undefined}
              className="absolute inset-0 flex flex-col overflow-hidden rounded-xl border border-white/15 bg-black shadow-[0_20px_50px_-20px_rgba(0,0,0,0.9)]"
            >
              <div className="h-[74%] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src(c.file)}
                  alt={c.title}
                  draggable={false}
                  className="pointer-events-none h-full w-full object-cover grayscale"
                />
              </div>
              <div className="flex flex-1 items-center justify-between gap-3 border-t border-white/10 px-4 font-mono">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-white">{c.title}</p>
                  {c.issuer && (
                    <p className="truncate text-[10px] uppercase tracking-wider text-white/45">{c.issuer}</p>
                  )}
                </div>
                {top && <span className="shrink-0 text-[10px] uppercase tracking-widest text-white/30">tap ⤢</span>}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Deck controls */}
      <div className="mt-6 flex items-center justify-center gap-5 font-mono text-sm">
        <button
          onClick={prev}
          aria-label="Previous"
          className="rounded border border-white/25 px-3 py-1 text-white transition-colors hover:bg-white hover:text-black"
        >
          ←
        </button>
        <span className="tabular-nums text-white/60">
          {String(index + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
        </span>
        <button
          onClick={next}
          aria-label="Next"
          className="rounded border border-white/25 px-3 py-1 text-white transition-colors hover:bg-white hover:text-black"
        >
          →
        </button>
      </div>

      {/* View all */}
      <div className="mt-8 flex justify-center">
        <button
          onClick={() => setShowAll((v) => !v)}
          className="rounded-full border border-white/25 bg-white/5 px-6 py-2.5 font-mono text-xs uppercase tracking-widest text-white transition-colors hover:bg-white hover:text-black"
        >
          {showAll ? '▲ Show less' : `▼ View all (${certificates.length})`}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {showAll && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4 }}
            className="overflow-hidden"
          >
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {certificates.map((c) => (
                <GridCard key={c.file} c={c} onOpen={setActive} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {mounted && createPortal(lightbox, document.body)}
    </GlassSection>
  )
}
