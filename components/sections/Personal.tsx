'use client'

import { useCallback, useMemo, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import Duck from '@/components/duck/Duck'
import CertLightbox from '@/components/ui/CertLightbox'
import { certificates, moments, type Certificate } from '@/data/portfolio'
import { ui } from '@/data/ui'
import { useLang } from '@/lib/use-lang'
import { useTint } from '@/lib/tint'

/**
 * 07 · PERSONAL - "This is where it gets personal." Every album from the
 * events (data/portfolio.ts `moments`) as a filmstrip: one print on the
 * stage, the whole roll underneath.
 *
 * This replaced a fan of prints. At thirteen albums the fan buried its own
 * cards - ten of the eleven labels were truncated to three or four letters,
 * the leftmost prints fell off a phone screen entirely, and the whole thing
 * was `whileHover`, so a phone got a static pile with nothing to press.
 *
 * It is NOT scroll-driven, deliberately. The projects film pins its stage
 * and takes the wheel, and the page's inertia (lib/smooth-scroll.ts) stands
 * down while it holds it; a second section doing that is a second thing to
 * get wrong. This one is dragged, swiped, clicked or arrowed, and the wheel
 * passes straight through to the page.
 */
const thumb = (key: string, file: string) => `/moments/${key}/thumbs/${file}`
const SWIPE_PX = 60 // drag past this and the strip moves on

export default function Personal() {
  const t = ui[useLang()].personal
  const reduce = useReducedMotion()
  const ref = useTint('personal')
  const [open, setOpen] = useState<{ cert: Certificate | null; albumKey: string; photo: string } | null>(null)
  const [i, setI] = useState(0)
  const dragged = useRef(false)

  // every album, whether or not a certificate points at it: two of them
  // (the brand ambassador and the outstanding student) have photographs and
  // no certificate, and used to be unreachable from anywhere on the site
  const albums = useMemo(
    () =>
      Object.entries(moments)
        .filter(([, album]) => album.photos.length > 0)
        .map(([key, album]) => ({ key, album, cert: certificates.find((c) => c.moment === key) ?? null })),
    [],
  )
  const n = albums.length
  const current = albums[i]
  const go = useCallback((next: number) => setI((next + n) % n), [n])

  const photos = albums.reduce((s, a) => s + a.album.photos.length, 0)

  return (
    <section ref={ref} id="personal" className="relative isolate scroll-mt-28 overflow-x-clip px-4 py-16 sm:px-6 sm:py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute left-2 bottom-0 -z-10 select-none font-crt text-[10rem] leading-none text-fg/[0.04] sm:text-[18.75rem]"
      >
        MOMENTS
      </div>
      <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] lg:items-center">
        <div className="flex flex-col gap-4">
          <span className="font-mono text-[0.6875rem] uppercase tracking-[0.35em] text-fg-dim">[ 07 · {t.label} ]</span>
          <h2 className="font-crt text-5xl leading-[0.95] th:leading-[1.25] text-fg txt-glow sm:text-6xl">
            {t.title1}
            <br />
            {t.title2}
          </h2>
          <p className="font-mono text-[0.75rem] text-fg-muted">
            {n} albums · {photos} photos · {t.hint}
          </p>
          <Duck pose="sleep" width={240} parallax={6} className="mt-4 hidden lg:block" />
        </div>

        {/* min-w-0: without it the implicit grid column on a phone sizes to
            the strip's max-content - thirteen thumbs, about 940px - and the
            print, being w-full, is dragged out past the screen with it */}
        <div className="flex min-w-0 flex-col gap-4">
          {/* the stage. Arrow keys move the strip; the print itself opens it */}
          <div
            role="group"
            aria-roledescription="carousel"
            aria-label={t.label}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight') { e.preventDefault(); go(i + 1) }
              if (e.key === 'ArrowLeft') { e.preventDefault(); go(i - 1) }
            }}
            className="relative rounded-lg focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-fg"
          >
            <motion.div
              // remounted per album, never an exit animation: framer's exits
              // do not settle in this project (see the projects film)
              key={current.key}
              initial={reduce ? false : { opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              drag={reduce ? false : 'x'}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.18}
              onDragStart={() => { dragged.current = false }}
              onDrag={(_, info) => { if (Math.abs(info.offset.x) > 6) dragged.current = true }}
              onDragEnd={(_, info) => {
                if (info.offset.x < -SWIPE_PX) go(i + 1)
                else if (info.offset.x > SWIPE_PX) go(i - 1)
              }}
              className="cursor-grab active:cursor-grabbing"
            >
              <button
                type="button"
                onClick={() => {
                  if (dragged.current) return // that was a swipe, not a press
                  setOpen({ cert: current.cert, albumKey: current.key, photo: current.album.photos[0] })
                }}
                data-cursor-label="open album"
                aria-label={`${t.hint}: ${current.album.label}`}
                className="block w-full rounded-[0.1875rem] bg-[#f3f0e8] p-2 pb-3 text-left shadow-[0_18px_40px_rgba(0,0,0,0.28)]"
              >
                <span className="relative block aspect-4/3 w-full overflow-hidden bg-neutral-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={thumb(current.key, current.album.photos[0])}
                    alt=""
                    draggable={false}
                    className="h-full w-full object-cover"
                  />
                </span>
              </button>
            </motion.div>

            {/* for a mouse that will not think to drag */}
            {[-1, 1].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => go(i + d)}
                aria-label={d < 0 ? 'Previous album' : 'Next album'}
                className={`absolute top-1/2 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-fg/20 bg-bg/85 font-mono text-fg backdrop-blur transition-colors hover:bg-fg hover:text-bg focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg sm:grid ${
                  d < 0 ? '-left-5' : '-right-5'
                }`}
              >
                {d < 0 ? '‹' : '›'}
              </button>
            ))}
          </div>

          <p className="flex items-baseline gap-3 font-mono text-[0.75rem]">
            <span className="tabular-nums text-fg-dim">
              {String(i + 1).padStart(2, '0')}/{String(n).padStart(2, '0')}
            </span>
            <span className="min-w-0 truncate font-semibold uppercase tracking-[0.12em] text-fg">
              {current.album.label}
            </span>
            <span className="ml-auto shrink-0 text-fg-dim">{current.album.photos.length} photos</span>
          </p>

          {/* the roll: every album at once, so nobody browses blind.
              NO data-lenis-prevent here. It is for a pane that scrolls the
              way the page does and must keep the wheel to itself; this one
              only scrolls sideways, and the attribute cost the page its
              scroll entirely - lenis.css puts overscroll-behavior:contain on
              every prevent variant, so a vertical wheel over the strip
              chained nowhere and the page froze under the pointer. Lenis
              reads vertical gestures only, so a sideways one already falls
              through to this element on its own. */}
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {albums.map((a, k) => (
              <button
                key={a.key}
                type="button"
                onClick={() => go(k)}
                aria-current={k === i}
                aria-label={a.album.label}
                title={a.album.label}
                className={`relative h-12 w-16 shrink-0 overflow-hidden rounded-[0.125rem] border transition-opacity focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg ${
                  k === i ? 'border-fg opacity-100' : 'border-fg/20 opacity-70 hover:opacity-100'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={thumb(a.key, a.album.photos[0])}
                  alt=""
                  loading="lazy"
                  draggable={false}
                  className={`h-full w-full object-cover transition-[filter] duration-300 ${k === i ? '' : 'grayscale contrast-110'}`}
                />
                {k !== i && <span aria-hidden className="dither pointer-events-none absolute inset-0 opacity-50 mix-blend-multiply" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      <CertLightbox
        cert={open?.cert ?? null}
        albumKey={open?.albumKey ?? null}
        initialPhoto={open?.photo}
        onClose={() => setOpen(null)}
      />
    </section>
  )
}
