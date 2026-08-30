'use client'

import { motion } from 'framer-motion'
import { certThumb, categorize, catMeta, LEVEL_TAG } from '@/lib/certs'
import type { Certificate } from '@/data/portfolio'

/**
 * One certificate as a white card. Shared by the home section and the full
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
      className="group flex h-full w-full flex-col overflow-hidden rounded-2xl bg-white text-left shadow-[0_12px_40px_-14px_rgba(0,0,0,0.7)] transition-shadow hover:shadow-[0_28px_70px_-16px_rgba(0,0,0,0.85)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
    >
      <div className="relative aspect-[4/3] w-full shrink-0 bg-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={certThumb(c.file)}
          alt={c.title}
          loading="lazy"
          draggable={false}
          className="absolute inset-0 h-full w-full object-contain p-1.5"
        />
        {c.medal && (
          <span
            className={`absolute right-3 top-3 rounded-full px-2 py-0.5 font-sans text-[10px] font-bold shadow ${c.medal === 'gold' ? 'bg-amber-400 text-amber-950' : 'bg-orange-300 text-orange-950'}`}
          >
            {c.medal === 'gold' ? 'GOLD' : '3RD'}
          </span>
        )}
        {c.level && !c.medal && (c.level === 'National' || c.level === 'International') && (
          <span className="absolute right-3 top-3 rounded bg-neutral-900/85 px-1.5 py-0.5 font-mono text-[9px] font-semibold tracking-wider text-white">
            {LEVEL_TAG[c.level]}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col border-t border-neutral-100 p-4">
        <span
          className={`inline-block rounded-full px-2.5 py-0.5 font-sans text-[11px] font-semibold ${catMeta(categorize(c)).chip}`}
        >
          {catMeta(categorize(c)).label}
        </span>
        <h3 className="mt-2 line-clamp-2 font-sans text-base font-semibold leading-snug text-neutral-900">
          {c.title}
        </h3>
        {c.issuer && <p className="mt-1 truncate font-sans text-xs text-neutral-500">{c.issuer}</p>}
        {(c.result || c.date) && (
          <p className="mt-auto truncate pt-2 font-mono text-[10px] uppercase tracking-wider text-neutral-400">
            {[c.result, c.date].filter(Boolean).join(' · ')}
          </p>
        )}
      </div>
    </motion.button>
  )
}
