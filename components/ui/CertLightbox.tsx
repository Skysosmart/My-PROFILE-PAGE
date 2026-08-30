'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { certSrc, categorize, catMeta } from '@/lib/certs'
import type { Certificate } from '@/data/portfolio'

const MEDAL_FILL: Record<string, string> = {
  gold: 'radial-gradient(circle at 32% 28%, #F7E7A6 0%, #D9B441 38%, #A9821A 72%, #7A5D11 100%)',
  bronze: 'radial-gradient(circle at 32% 28%, #F0C9A0 0%, #C98A4F 38%, #9A5F2C 72%, #6E4220 100%)',
}

/** The record view: the document beside its metadata and, where there is one, its story. */
export default function CertLightbox({
  cert,
  onClose,
}: {
  cert: Certificate | null
  onClose: () => void
}) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!cert) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [cert, onClose])

  const rows = (c: Certificate): [string, string][] => {
    const r: [string, string][] = []
    if (c.issuer) r.push(['ISSUER', c.issuer])
    if (c.level) r.push(['LEVEL', c.level])
    if (c.date) r.push(['DATE', c.date])
    if (c.result) r.push(['RESULT', c.result])
    if (c.credential) r.push(['CREDENTIAL', c.credential])
    return r
  }

  const ui = (
    <AnimatePresence>
      {cert && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[95] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.95, y: 12, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.97, opacity: 0 }}
            transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={cert.title}
            className="relative grid w-full max-w-6xl overflow-hidden rounded-3xl bg-neutral-950 shadow-2xl lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]"
          >
            <div className="flex max-h-[52vh] items-center justify-center bg-neutral-100 p-3 sm:p-5 lg:max-h-[82vh]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={certSrc(cert.file)}
                alt={cert.title}
                className="max-h-[46vh] w-auto max-w-full object-contain drop-shadow-xl lg:max-h-[74vh]"
              />
            </div>
            <div className="flex max-h-[38vh] flex-col overflow-y-auto p-5 sm:p-6 lg:max-h-[82vh]">
              <div className="flex items-start justify-between gap-3">
                <span
                  className={`inline-block rounded-full px-2.5 py-0.5 font-sans text-[11px] font-semibold ${catMeta(categorize(cert)).chip}`}
                >
                  {catMeta(categorize(cert)).label}
                </span>
                {cert.medal && (
                  <span
                    aria-hidden
                    style={{ background: MEDAL_FILL[cert.medal] }}
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-full shadow-[0_2px_10px_-2px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.5)]"
                  >
                    <span className="font-pixel text-[6px] leading-none text-black/55">
                      {cert.medal === 'gold' ? 'GOLD' : '3RD'}
                    </span>
                  </span>
                )}
              </div>
              <h3 className="mt-3 font-sans text-xl font-semibold leading-snug text-white">
                {cert.title}
              </h3>
              <dl className="mt-4 space-y-1.5 border-t border-white/10 pt-4 font-mono text-[12px]">
                {rows(cert).map(([k, v]) => (
                  <div key={k} className="flex gap-3">
                    <dt className="w-24 shrink-0 uppercase tracking-wider text-white/35">{k}</dt>
                    <dd className="min-w-0 text-white/80">{v}</dd>
                  </div>
                ))}
              </dl>
              {cert.detail && (
                <p className="mt-4 border-t border-white/10 pt-4 font-sans text-sm leading-relaxed text-white/65">
                  {cert.detail}
                </p>
              )}
              <button
                onClick={onClose}
                className="mt-auto self-start rounded-full bg-white px-4 py-2 font-sans text-sm font-medium text-neutral-900 transition-colors hover:bg-white/85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  return mounted ? createPortal(ui, document.body) : null
}
