'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'

/**
 * The opening film (opening/ renders it): the boot cursor becomes a point,
 * the point routes out to the things Sky builds, and the ZaruTech lettering
 * lands on the duck's chest as the hero builds around it. Its last frame is
 * the hero itself, captured from this site.
 *
 * So the site is mounted *behind* the film before it ends (onReveal), and has
 * finished its own rise-in by the time the film fades off it (onDone): the
 * cut lands on a page that is already still, instead of replaying the hero.
 *
 * There is one cut per screen shape, each ending on the hero as that device
 * lays it out (a phone stacks it; an iPad gets the desktop layout at 1024 or
 * 1280 wide, see lib/viewport.ts). The closest shape plays, filling the screen.
 *
 * Browsers only autoplay muted video. It tries with sound first and falls
 * back to muted with a sound toggle. Click or any key skips.
 */
const REVEAL_AT = 8.0 // seconds into the film: the site mounts behind it
// the cuts and the screen shape (width / height) each was rendered for
const CUTS = [
  { file: 'zarutech-opening', aspect: 1920 / 1080 }, // desktop
  { file: 'zarutech-opening-tablet-l', aspect: 1280 / 892 }, // iPad, landscape
  { file: 'zarutech-opening-tablet-p', aspect: 1024 / 1468 }, // iPad, portrait
  { file: 'zarutech-opening-phone', aspect: 390 / 844 }, // phone
]
const closest = (aspect: number) =>
  CUTS.reduce((a, b) => (Math.abs(Math.log(b.aspect / aspect)) < Math.abs(Math.log(a.aspect / aspect)) ? b : a))

export default function OpeningFilm({ onReveal, onDone }: { onReveal: () => void; onDone: () => void }) {
  const video = useRef<HTMLVideoElement>(null)
  const [muted, setMuted] = useState(false)
  const [leaving, setLeaving] = useState(false)
  // picked once, on mount (this only ever renders on the client, after
  // Portfolio has chosen the phase): turning the device mid-film refits, never swaps
  const [cut] = useState(() => closest(innerWidth / innerHeight))
  // fill the screen when the cut's shape is close to it, otherwise show it
  // whole; its paper is the site's paper, so the bars do not read
  const [fit, setFit] = useState<'cover' | 'contain'>('cover')
  const revealed = useRef(false)
  const done = useRef(false)

  const reveal = useCallback(() => {
    if (revealed.current) return
    revealed.current = true
    onReveal()
  }, [onReveal])
  const finish = useCallback(() => {
    if (done.current) return
    done.current = true
    onDone()
  }, [onDone])
  const leave = useCallback(() => {
    reveal()
    setLeaving(true)
  }, [reveal])

  useEffect(() => {
    const refit = () => setFit(Math.abs(Math.log(cut.aspect / (innerWidth / innerHeight))) < 0.3 ? 'cover' : 'contain')
    refit()
    addEventListener('resize', refit)
    return () => removeEventListener('resize', refit)
  }, [cut])

  useEffect(() => {
    const v = video.current
    if (!v) return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      reveal()
      finish()
      return
    }
    v.muted = false
    v.play().catch(() => {
      // autoplay with sound refused: play muted, offer the sound
      v.muted = true
      setMuted(true)
      v.play().catch(leave) // refused even muted (data saver, low power): straight to the site
    })
  }, [cut, reveal, finish, leave])

  // Safety nets: a stalled or missing video must never strand the visitor.
  useEffect(() => {
    const t = window.setTimeout(leave, 16000)
    return () => clearTimeout(t)
  }, [leave])
  useEffect(() => {
    if (!leaving) return
    const t = window.setTimeout(finish, 1200)
    return () => clearTimeout(t)
  }, [leaving, finish])

  useEffect(() => {
    // M toggles the sound; any other key skips
    const onKey = (e: KeyboardEvent) => {
      const v = video.current
      if ((e.key === 'm' || e.key === 'M') && v) {
        v.muted = !v.muted
        setMuted(v.muted)
        return
      }
      leave()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [leave])

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation()
    const v = video.current
    if (!v) return
    v.muted = !v.muted
    setMuted(v.muted)
  }

  return (
    <motion.div
      onClick={leave}
      initial={{ opacity: 1 }}
      animate={{ opacity: leaving ? 0 : 1 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      onAnimationComplete={() => leaving && finish()}
      className="fixed inset-0 z-80 cursor-pointer overflow-hidden bg-void"
    >
      <video
        ref={video}
        playsInline
        preload="auto"
        onTimeUpdate={e => e.currentTarget.currentTime >= REVEAL_AT && reveal()}
        onEnded={leave}
        className="h-full w-full"
        style={{ objectFit: fit }}
      >
        {/* H.264 first; VP9 for the browsers built without it (some Chromium builds).
            With <source>s the error lands on the source, not the video: only the
            last one failing means none can play */}
        <source src={`/film/${cut.file}.mp4`} type="video/mp4" />
        <source src={`/film/${cut.file}.webm`} type="video/webm" onError={leave} />
      </video>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between gap-4 whitespace-nowrap px-5 pb-4 font-mono text-[0.75rem] uppercase tracking-[0.2em] text-fg-dim sm:text-[0.8125rem] sm:tracking-[0.25em]">
        <button
          type="button"
          onClick={toggleSound}
          className="pointer-events-auto rounded-sm px-1 py-0.5 hover:text-fg"
          aria-label={muted ? 'Turn sound on' : 'Turn sound off'}
        >
          {muted ? '♪ sound off' : '♪ sound on'}
        </button>
        <span>
          <span className="sm:hidden">tap to skip</span>
          <span className="max-sm:hidden">click or press any key to skip</span>
        </span>
      </div>
    </motion.div>
  )
}
