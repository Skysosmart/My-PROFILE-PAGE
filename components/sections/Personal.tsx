'use client'

import { useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import Duck from '@/components/duck/Duck'
import CertLightbox from '@/components/ui/CertLightbox'
import { certificates, moments, type Certificate } from '@/data/portfolio'
import { ui } from '@/data/ui'
import { useLang } from '@/lib/use-lang'

/**
 * 05 · PERSONAL - "This is where it gets personal." The photo albums from
 * the events (data/portfolio.ts `moments`) were only reachable through a
 * certificate's lightbox; here they fan out as a stack of prints, one per
 * album, halftoned at rest and in colour under the pointer. A click opens
 * the album in the same lightbox, on that photo.
 */
const thumb = (key: string, file: string) => `/moments/${key}/thumbs/${file}`

export default function Personal() {
  const t = ui[useLang()].personal
  const reduce = useReducedMotion()
  const [open, setOpen] = useState<{ cert: Certificate; photo: string } | null>(null)

  // one card per album, through the certificate that points at it
  const cards = useMemo(
    () =>
      Object.entries(moments)
        .map(([key, album]) => {
          const cert = certificates.find((c) => c.moment === key)
          return cert && album.photos[0] ? { key, album, cert, photo: album.photos[0] } : null
        })
        .filter((c): c is NonNullable<typeof c> => c !== null),
    [],
  )
  // fan angles spread evenly across the stack, a little offset each
  const n = cards.length
  const spread = 32

  return (
    <section id="personal" className="relative isolate scroll-mt-28 overflow-x-clip px-4 py-16 sm:px-6 sm:py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute left-2 bottom-0 -z-10 select-none font-crt text-[10rem] leading-none text-fg/[0.04] sm:text-[18.75rem]"
      >
        MOMENTS
      </div>
      <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:items-center">
        <div className="flex flex-col gap-4">
          <span className="font-mono text-[0.6875rem] uppercase tracking-[0.35em] text-fg-dim">[ 07 · {t.label} ]</span>
          <h2 className="font-crt text-5xl leading-[0.95] text-fg txt-glow sm:text-6xl">
            {t.title1}
            <br />
            {t.title2}
          </h2>
          <p className="font-mono text-[0.75rem] text-fg-muted">
            {n} albums · {cards.reduce((s, c) => s + c.album.photos.length, 0)} photos · {t.hint}
          </p>
          <Duck pose="sleep" width={240} parallax={6} className="mt-4 hidden lg:block" />
        </div>

        <div className="relative mx-auto h-[23.75rem] w-full max-w-[35rem] sm:h-[28.75rem]">
          {cards.map((c, i) => {
            const angle = -spread / 2 + (spread * i) / Math.max(n - 1, 1)
            const left = 6 + (70 * i) / Math.max(n - 1, 1)
            return (
              <motion.button
                key={c.key}
                type="button"
                onClick={() => setOpen({ cert: c.cert, photo: c.photo })}
                data-cursor-label="open album"
                initial={reduce ? false : { opacity: 0, y: 30, rotate: angle }}
                whileInView={{ opacity: 1, y: 0, rotate: angle }}
                whileHover={reduce ? undefined : { y: -18, rotate: 0, zIndex: 40, scale: 1.04 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                aria-label={c.album.label}
                style={{ left: `${left}%`, top: `${12 + Math.abs(angle) * 0.9}%`, zIndex: i }}
                className="group absolute w-[46%] -translate-x-1/2 rounded-[0.1875rem] bg-[#f3f0e8] p-1.5 pb-7 text-left shadow-[0_20px_40px_rgba(0,0,0,0.55)] transition-shadow hover:shadow-[0_30px_60px_rgba(0,0,0,0.7)] focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg sm:w-[44%]"
              >
                <span className="relative block aspect-4/3 w-full overflow-hidden bg-neutral-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={thumb(c.key, c.photo)}
                    alt=""
                    loading="lazy"
                    draggable={false}
                    className="h-full w-full object-cover grayscale contrast-110 transition-[filter] duration-500 group-hover:grayscale-0 group-hover:contrast-100"
                  />
                  {/* halftone: a dot screen over the print, lifted on hover */}
                  <span
                    aria-hidden
                    className="dither pointer-events-none absolute inset-0 opacity-60 mix-blend-multiply transition-opacity duration-500 group-hover:opacity-0"
                  />
                </span>
                <span className="mt-2 block truncate px-0.5 font-mono text-[0.5625rem] uppercase tracking-[0.2em] text-neutral-800">
                  {c.album.label}
                </span>
              </motion.button>
            )
          })}
        </div>
      </div>

      <CertLightbox cert={open?.cert ?? null} initialPhoto={open?.photo} onClose={() => setOpen(null)} />
    </section>
  )
}
