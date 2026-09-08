'use client'

import { useCallback, useMemo, useState, useSyncExternalStore } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import CertLightbox from '@/components/ui/CertLightbox'
import Desk from '@/components/personal/Desk'
import Stack from '@/components/personal/Stack'
import type { Album } from '@/components/personal/PrintCard'
import { certificates, type Certificate } from '@/data/portfolio'
import { ui } from '@/data/ui'
import { useContent } from '@/lib/use-content'
import { useLang } from '@/lib/use-lang'
import { useTint } from '@/lib/tint'

/**
 * 07 · PERSONAL - "This is where it gets personal." Every album from the
 * events (data/portfolio.ts `moments`) as a photographic print you can pick
 * up and turn over.
 *
 * This replaced a carousel, which replaced a fan. The carousel worked but it
 * was a widget: a stage, two arrows, a counter and a roll of thumbs so small
 * that the halftone over the inactive ones read as grey noise. Worse, it put
 * every control in the right-hand column and left the left one empty - a
 * headline, a line of counts and a sleeping duck over four hundred pixels of
 * nothing.
 *
 * Prints on a desk fix both. The page is already printed matter - the spec
 * label is a sticker, the quick start is clipped notes, the school crests sit
 * on cream discs - so a pile of photographs is the material this site is made
 * of, and a pile needs the whole width rather than a column.
 *
 * It is still NOT scroll-driven, and for the same reason as before: the
 * projects film pins its stage and takes the wheel, and the page's inertia
 * (lib/smooth-scroll.ts) stands down while it holds it. A second section
 * doing that is a second thing to get wrong. This one is dragged, flicked,
 * tapped or tabbed, and the wheel passes straight through to the page.
 */

/* `lg`, read once and subscribed to - the desk needs room to scatter and the
   phone gets the pile instead. A media query rather than CSS so only one of
   the two ever mounts: rendering both would put twenty-six prints in the DOM
   to show thirteen. Safe against hydration because this whole section is
   loaded with ssr:false (components/Portfolio.tsx). */
const QUERY = '(min-width: 64rem)'
let mql: MediaQueryList | null = null
const query = () => (mql ??= window.matchMedia(QUERY))
const subscribe = (cb: () => void) => {
  const m = query()
  m.addEventListener('change', cb)
  return () => m.removeEventListener('change', cb)
}
const onDesk = () => query().matches
const onServer = () => false

export default function Personal() {
  const lang = useLang()
  const t = ui[lang].personal
  const { moments } = useContent()
  const reduce = useReducedMotion()
  const ref = useTint('personal')
  const wide = useSyncExternalStore(subscribe, onDesk, onServer)

  const [open, setOpen] = useState<{ cert: Certificate | null; albumKey: string; photo: string } | null>(null)
  const [flipped, setFlipped] = useState<string | null>(null)

  // every album, whether or not a certificate points at it: two of them (the
  // brand ambassador and the outstanding student) have photographs and no
  // certificate, and used to be unreachable from anywhere on the site
  const albums: Album[] = useMemo(
    () =>
      Object.entries(moments)
        .filter(([, album]) => album.photos.length > 0)
        .map(([key, album]) => ({ key, album, cert: certificates.find((c) => c.moment === key) ?? null })),
    [moments],
  )
  const n = albums.length
  const photos = albums.reduce((s, a) => s + a.album.photos.length, 0)

  const flip = useCallback((key: string) => setFlipped((f) => (f === key ? null : key)), [])
  const openAlbum = useCallback(
    (entry: Album) => setOpen({ cert: entry.cert, albumKey: entry.key, photo: entry.album.photos[0] }),
    [],
  )

  const faces = { turn: t.turn, turnBack: t.turnBack, photos: t.photos, seeAll: t.seeAll, earned: t.earned }

  return (
    <section
      ref={ref}
      id="personal"
      className="relative isolate scroll-mt-28 overflow-x-clip px-4 py-16 sm:px-6 sm:py-24"
      // Escape turns the open print back over, wherever focus is inside the
      // section. A flipped card is a state the reader got into by pressing
      // something, so there has to be a key that gets them out of it.
      onKeyDown={(e) => {
        if (e.key === 'Escape' && flipped) {
          e.stopPropagation()
          setFlipped(null)
        }
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute left-2 bottom-0 -z-10 select-none font-crt text-[10rem] leading-none text-fg/[0.04] sm:text-[18.75rem]"
      >
        MOMENTS
      </div>

      {/* The reveal the section never had. `amount: 'some'` because the desk
          is taller than the viewport and the 0.2 default could never be
          satisfied - the observer would never fire and the prints would stay
          hidden for good. */}
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 'some' }}
        variants={{ show: { transition: { staggerChildren: reduce ? 0 : 0.045 } } }}
        className="mx-auto flex w-full max-w-6xl flex-col gap-8"
      >
        <motion.div
          variants={{ hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col gap-4"
        >
          <span className="font-mono text-[0.6875rem] uppercase tracking-[0.35em] text-fg-dim">[ 07 · {t.label} ]</span>
          <h2 className="font-crt text-5xl leading-[0.95] th:leading-[1.25] text-fg txt-glow sm:text-6xl">
            {t.title1}
            <br />
            {t.title2}
          </h2>
          <p className="font-mono text-[0.75rem] text-fg-muted">
            {n} albums · {photos} photos ·{' '}
            {/* the hint has to describe the gesture the reader actually has */}
            <span className="pointer-coarse:hidden">{t.hint}</span>
            <span className="hidden pointer-coarse:inline">{t.hintCoarse}</span>
          </p>
        </motion.div>

        {wide ? (
          <Desk albums={albums} flipped={flipped} onFlip={flip} onOpen={openAlbum} t={faces} />
        ) : (
          <Stack albums={albums} flipped={flipped} onFlip={flip} onOpen={openAlbum} t={faces} nextLabel={t.next} />
        )}
      </motion.div>

      <CertLightbox
        cert={open?.cert ?? null}
        albumKey={open?.albumKey ?? null}
        initialPhoto={open?.photo}
        onClose={() => setOpen(null)}
      />
    </section>
  )
}
