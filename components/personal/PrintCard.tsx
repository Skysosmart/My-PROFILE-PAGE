'use client'

import Image from 'next/image'
import { motion, useReducedMotion } from 'motion/react'
import type { Certificate, Moment } from '@/data/portfolio'
import { fmt } from '@/data/ui'

export type Album = {
  key: string
  album: Moment
  /** the one certificate worth naming on the back */
  cert: Certificate | null
  /** how many the event earned in total - MakeX earned seven from one campaign */
  certCount: number
}

/** the album's cover thumb; the full-size file is only fetched by the lightbox */
export const cover = (key: string, file: string) => `/moments/${key}/thumbs/${file}`

type Labels = {
  turn: string
  turnBack: string
  photos: string
  seeAll: string
  earned: string
  more: string
}

/**
 * One photograph, as a print you can turn over.
 *
 * The front is the picture on the site's printed stock - the same #f3f0e8,
 * the same 1px rgba(17,17,17,0.45) edge and the same hard offset shadow the
 * spec label and the quick-start notes use. The back is the same card with
 * no picture: what the day was, in Sky's words, and the certificate it
 * earned where there is one.
 *
 * The flip is one `rotateY` on a preserve-3d container with BOTH faces
 * permanently mounted. That matters: this project forbids framer's exit
 * animations outright (see the projects film and the old carousel here) -
 * "they do not settle in this project and have twice left invisible elements
 * over the page swallowing clicks". Nothing unmounts here, so there is
 * nothing to exit.
 *
 * The face turned away is `inert`, not merely invisible. `backface-visibility`
 * hides it from the eye only: without the second half a screen reader reads
 * both faces, so every print announces twice, and Tab lands on buttons nobody
 * can see. One attribute does the lot - not focusable, not clickable, not
 * read out - where `aria-hidden` alone would still leave them in the tab
 * order.
 */
export default function PrintCard({
  entry,
  flipped,
  onFlip,
  onOpen,
  t,
  priority = false,
}: {
  entry: Album
  flipped: boolean
  onFlip: () => void
  onOpen: () => void
  t: Labels
  priority?: boolean
}) {
  const reduce = useReducedMotion()
  const { key, album, cert, certCount } = entry
  const face = 'absolute inset-0 [backface-visibility:hidden]'
  // the stock, in one place: change it here and both faces follow
  const stock =
    'rounded-[0.1875rem] border border-[#111]/45 bg-[#f3f0e8] text-[#111] shadow-[5px_5px_0_rgba(17,17,17,0.9)]'

  return (
    // perspective on the outer box, never on the rotating element itself -
    // a transformed ancestor would flatten it and the flip would read as a
    // squash rather than a turn
    <div className="relative aspect-4/5 w-full [perspective:1200px]">
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={reduce ? { duration: 0 } : { duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative h-full w-full [transform-style:preserve-3d]"
      >
        {/* ---- front: the photograph ---- */}
        <button
          type="button"
          onClick={onFlip}
          inert={flipped}
          aria-label={`${t.turn}: ${album.label}`}
          data-cursor-label={t.turn}
          className={`${face} ${stock} flex flex-col p-2 pb-6 text-left focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-fg`}
        >
          <span className="relative block min-h-0 flex-1 overflow-hidden bg-neutral-200">
            <Image
              src={cover(key, album.photos[0])}
              alt=""
              fill
              draggable={false}
              priority={priority}
              loading={priority ? undefined : 'lazy'}
              // one print is about a fifth of the desk at lg and nearly the
              // whole screen on a phone; without this next/image serves the
              // full 520px thumb to every card at every size
              sizes="(min-width: 1024px) 22vw, 88vw"
              className="object-cover"
            />
          </span>
          {/* the white lip under a photo print, where a hand writes the date */}
          <span className="mt-2 block truncate font-mono text-[0.5625rem] uppercase tracking-[0.14em] th:tracking-[0.04em] text-[#111]/60">
            {album.label}
          </span>
        </button>

        {/* ---- back: what the day was ---- */}
        <div
          inert={!flipped}
          className={`${face} ${stock} [transform:rotateY(180deg)] flex flex-col gap-3 p-4`}
        >
          <p className="font-mono text-[0.625rem] uppercase leading-[1.3] th:leading-[1.7] tracking-[0.16em] th:tracking-[0.04em] text-[#111]/70">
            {album.label}
          </p>

          {/* a ruled line, the way the back of a photo is ruled */}
          <span aria-hidden className="h-px w-full bg-[#111]/20" />

          {/* The line is optional and stays optional. Until Sky writes the
              thirteen, the back closes up around the gap and carries the
              count and the certificate on their own, rather than showing an
              empty paragraph or a placeholder nobody asked for. */}
          {album.line ? (
            <p className="font-sans text-[0.8125rem] leading-relaxed th:leading-[1.75] text-[#111]/85">{album.line}</p>
          ) : null}

          <div className="mt-auto flex flex-col gap-2">
            {/* one title, then the count of the rest: an event can earn more
                than one certificate, and naming only the first would hide six
                of MakeX's seven */}
            {cert && (
              <p className="font-mono text-[0.5625rem] uppercase leading-[1.4] th:leading-[1.7] tracking-[0.12em] th:tracking-[0.03em] text-[#111]/55">
                {t.earned} · {cert.title}
                {certCount > 1 && <span className="text-[#111]/45"> · {fmt(t.more, { n: certCount - 1 })}</span>}
              </p>
            )}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onOpen}
                data-cursor-label="open album"
                className="rounded-xs border border-[#111]/40 px-2 py-1 font-mono text-[0.5625rem] uppercase tracking-[0.12em] th:tracking-[0.03em] transition-colors hover:bg-[#111] hover:text-[#f3f0e8] focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg"
              >
                {fmt(t.seeAll, { n: album.photos.length })}
              </button>
              <button
                type="button"
                onClick={onFlip}
                className="font-mono text-[0.5625rem] uppercase tracking-[0.12em] th:tracking-[0.03em] text-[#111]/55 underline-offset-4 transition-colors hover:text-[#111] hover:underline focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg"
              >
                {t.turnBack}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
