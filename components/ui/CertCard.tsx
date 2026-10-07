'use client'

import Image from 'next/image'
import { motion } from 'motion/react'
import { certThumb, categorize, catMeta, LEVEL_TAG } from '@/lib/certs'
import type { Certificate } from '@/data/portfolio'

/**
 * One certificate as a card in the theme's panel colour; the scan itself
 * stays on a white well because scans are paper. Shared by the home section and the full
 * certificates page so the two can never drift apart.
 *
 * The image sits in a fixed 4:3 well and is contained, not cropped: every cell
 * is then the same size whatever shape the scan is, and portrait scans
 * letterbox rather than losing their heading.
 */
export default function CertCard({
  cert,
  index = 0,
  still = false,
  onOpen,
}: {
  cert: Certificate
  index?: number
  still?: boolean
  onOpen: (c: Certificate) => void
}) {
  const c = cert
  return (
    <motion.button
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.035, 0.35), ease: [0.16, 1, 0.3, 1] }}
      whileHover={still ? undefined : { y: -6 }}
      onClick={() => onOpen(c)}
      data-cursor-label="open"
      className="group flex h-full w-full flex-col overflow-hidden rounded-[6px] border border-[#111]/45 bg-white text-left shadow-[3px_3px_0_#111] transition-shadow hover:shadow-[6px_6px_0_#111] focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg"
    >
      <div className="relative aspect-4/3 w-full shrink-0 bg-white">
        <Image
          src={certThumb(c.file)}
          alt={c.title}
          fill
          sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
          draggable={false}
          className="object-contain p-1.5"
        />
        {c.medal && (
          <span
            className={`absolute right-3 top-3 rounded-full px-2 py-0.5 font-sans text-[0.75rem] font-bold shadow-sm ${c.medal === 'gold' ? 'bg-white text-neutral-900' : 'border border-white/60 bg-neutral-900/85 text-white'}`}
          >
            {c.medal === 'gold' ? 'GOLD' : '3RD'}
          </span>
        )}
        {c.level && !c.medal && (c.level === 'National' || c.level === 'International') && (
          <span className="absolute right-3 top-3 rounded-sm bg-neutral-900/85 px-1.5 py-0.5 font-mono text-[0.6875rem] font-semibold tracking-wider text-white">
            {LEVEL_TAG[c.level]}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col border-t border-[#111]/15 p-4">
        <span
          className={`inline-block self-start rounded-[3px] px-2 py-0.5 font-mono text-[0.75rem] font-semibold uppercase tracking-[0.06em] th:tracking-normal ${catMeta(categorize(c)).chip}`}
        >
          {catMeta(categorize(c)).label}
        </span>
        <h3 className="mt-2 line-clamp-2 font-sans text-base font-semibold leading-snug text-fg">
          {c.title}
        </h3>
        {c.issuer && <p className="mt-1 truncate font-sans text-xs text-fg-muted">{c.issuer}</p>}
        {(c.result || c.date) && (
          <p className="mt-auto truncate pt-2 font-mono text-[0.75rem] uppercase tracking-wider text-fg-dim">
            {[c.result, c.date].filter(Boolean).join(' · ')}
          </p>
        )}
      </div>
    </motion.button>
  )
}
