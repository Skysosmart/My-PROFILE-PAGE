'use client'

import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import GlassSection from '@/components/ui/GlassSection'
import CertWall from '@/components/effects/CertWall'
import { certificates, assets, type Certificate } from '@/data/portfolio'

const src = (file: string) => assets.certDir + encodeURIComponent(file)
const thumb = (file: string) => assets.certDir + 'thumbs/' + encodeURIComponent(file)

/**
 * CERTIFICATES — a modern gallery card system (deliberately NOT terminal-themed):
 * colorful category pills, light elevated cards with the full certificate on a
 * soft surface, Space Grotesk typography, staggered motion, and a clean lightbox.
 */

/** First matching rule wins; every cert lands in exactly one category. */
function categorize(c: Certificate): string {
  const s = `${c.title} ${c.issuer} ${c.file}`
  if (/makex|robot/i.test(s)) return 'robotics'
  if (/EC[_-]?Council|NDE|EHE|CTF|cyber|NCSA|RTARF/i.test(s)) return 'security'
  if (/\bAI\b|BOTNOI|python|\bdata\b|typhoon|CiRA|prompt|digital twin/i.test(s)) return 'ai-data'
  if (/\bENG\b|english|INTER/i.test(s)) return 'language'
  return 'misc'
}

const CATS: { key: string; label: string; chip: string; dot: string }[] = [
  { key: 'featured', label: 'Featured', chip: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  { key: 'robotics', label: 'Robotics', chip: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' },
  { key: 'security', label: 'Security', chip: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  { key: 'ai-data', label: 'AI & Data', chip: 'bg-violet-100 text-violet-700', dot: 'bg-violet-500' },
  { key: 'language', label: 'Language', chip: 'bg-sky-100 text-sky-700', dot: 'bg-sky-500' },
  { key: 'misc', label: 'More', chip: 'bg-neutral-200 text-neutral-700', dot: 'bg-neutral-400' },
]

export default function Certificates() {
  const [cat, setCat] = useState('featured')
  const [active, setActive] = useState<Certificate | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  // Category → items (featured is a curated extra collection).
  const byCat = useMemo(() => {
    const m = new Map<string, Certificate[]>()
    m.set('featured', certificates.filter((c) => c.featured))
    certificates.forEach((c) => {
      const k = categorize(c)
      m.set(k, [...(m.get(k) ?? []), c])
    })
    return m
  }, [])

  const items = byCat.get(cat) ?? []
  const catMeta = (k: string) => CATS.find((c) => c.key === k) ?? CATS[CATS.length - 1]

  // Escape closes the lightbox.
  useEffect(() => {
    if (!active) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setActive(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active])

  // Lightbox portaled to <body> so it escapes the section transform.
  const lightbox = (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setActive(null)}
          className="fixed inset-0 z-[95] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.94, y: 14, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl"
          >
            <div className="flex max-h-[80vh] items-center justify-center bg-neutral-100 p-3 sm:p-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src(active.file)}
                alt={active.title}
                className="max-h-[72vh] w-auto max-w-full object-contain drop-shadow-xl"
              />
            </div>
            <div className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6">
              <div className="min-w-0 font-sans">
                <span
                  className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${catMeta(categorize(active)).chip}`}
                >
                  {catMeta(categorize(active)).label}
                </span>
                <p className="mt-1.5 truncate text-lg font-semibold text-neutral-900">{active.title}</p>
                {active.issuer && <p className="truncate text-sm text-neutral-500">{active.issuer}</p>}
              </div>
              <button
                onClick={() => setActive(null)}
                aria-label="Close"
                className="shrink-0 rounded-full bg-neutral-900 px-4 py-2 font-sans text-sm font-medium text-white transition-colors hover:bg-neutral-700"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  return (
    <GlassSection
      id="certificates"
      index="02"
      title="Certificates"
      variant="flip"
      background={<CertWall />}
      fullScreen
      panel={false}
    >
      <p className="mb-5 max-w-2xl font-sans text-sm text-white/60">
        {certificates.length} awards and certifications across robotics, cybersecurity, AI &
        data, and more — tap any card to view it in full.
      </p>

      {/* Category pills */}
      <div className="mb-6 flex flex-wrap gap-2">
        {CATS.map((c) => {
          const activePill = c.key === cat
          const count = (byCat.get(c.key) ?? []).length
          return (
            <button
              key={c.key}
              onClick={() => setCat(c.key)}
              className={`relative rounded-full px-4 py-2 font-sans text-sm font-medium transition-colors ${
                activePill ? 'text-neutral-900' : 'text-white/70 hover:text-white'
              }`}
            >
              {activePill && (
                <motion.span
                  layoutId="cert-pill"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  className="absolute inset-0 rounded-full bg-white shadow-lg"
                />
              )}
              <span className="relative flex items-center gap-2">
                <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
                {c.label}
                <span className={activePill ? 'text-neutral-400' : 'text-white/35'}>{count}</span>
              </span>
            </button>
          )
        })}
      </div>

      {/* Masonry cards — every card takes the image's NATURAL shape, so the
          whole certificate is always shown edge-to-edge (never framed/cropped) */}
      <div
        key={cat}
        className="max-h-[58vh] columns-1 gap-5 overflow-y-auto pb-2 pr-1 sm:columns-2 lg:columns-3 [scrollbar-width:thin]"
      >
        {items.map((c, i) => (
          <motion.button
            key={c.file}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: Math.min(i * 0.04, 0.4), ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -6 }}
            onClick={() => setActive(c)}
            className="group mb-5 w-full break-inside-avoid overflow-hidden rounded-2xl bg-white text-left shadow-[0_12px_40px_-14px_rgba(0,0,0,0.7)] transition-shadow hover:shadow-[0_28px_70px_-16px_rgba(0,0,0,0.85)]"
          >
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={thumb(c.file)}
                alt={c.title}
                loading="lazy"
                draggable={false}
                className="block h-auto w-full"
              />
              {c.featured && cat !== 'featured' && (
                <span className="absolute right-3 top-3 rounded-full bg-amber-400 px-2 py-0.5 font-sans text-[10px] font-bold text-amber-950 shadow">
                  ★ Featured
                </span>
              )}
            </div>
            <div className="border-t border-neutral-100 p-4">
              <span
                className={`inline-block rounded-full px-2.5 py-0.5 font-sans text-[11px] font-semibold ${catMeta(categorize(c)).chip}`}
              >
                {catMeta(categorize(c)).label}
              </span>
              <h3 className="mt-2 line-clamp-2 font-sans text-base font-semibold leading-snug text-neutral-900">
                {c.title}
              </h3>
              {c.issuer && (
                <p className="mt-1 truncate font-sans text-xs text-neutral-500">{c.issuer}</p>
              )}
            </div>
          </motion.button>
        ))}
      </div>

      {mounted && createPortal(lightbox, document.body)}
    </GlassSection>
  )
}
