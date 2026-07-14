'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import GlassSection from '@/components/ui/GlassSection'
import { projects } from '@/data/portfolio'

const statusStyle: Record<string, string> = {
  Completed: 'border-white/50 text-white',
  'In Progress': 'border-white/30 text-white/70',
  Upcoming: 'border-white/20 text-white/50',
}

/** PROJECTS — horizontal drag/scroll carousel. */
export default function Projects() {
  const trackRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const drag = useRef({ down: false, startX: 0, startLeft: 0, moved: false })

  // card pitch (width + gap) for arrow stepping + active-dot math
  const cardPitch = useCallback(() => {
    const track = trackRef.current
    const first = track?.firstElementChild as HTMLElement | null
    if (!track || !first) return 1
    return first.offsetWidth + 16 // gap-4
  }, [])

  const onScroll = useCallback(() => {
    const track = trackRef.current
    if (!track) return
    setActive(Math.round(track.scrollLeft / cardPitch()))
  }, [cardPitch])

  const step = (dir: number) =>
    trackRef.current?.scrollBy({ left: dir * cardPitch(), behavior: 'smooth' })

  const goTo = (i: number) =>
    trackRef.current?.scrollTo({ left: i * cardPitch(), behavior: 'smooth' })

  // Mouse drag-to-scroll (native touch/trackpad scroll already works).
  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    const down = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      drag.current = { down: true, startX: e.clientX, startLeft: track.scrollLeft, moved: false }
    }
    const move = (e: PointerEvent) => {
      if (!drag.current.down) return
      const dx = e.clientX - drag.current.startX
      if (Math.abs(dx) > 4) drag.current.moved = true
      track.scrollLeft = drag.current.startLeft - dx
    }
    const up = () => (drag.current.down = false)
    track.addEventListener('pointerdown', down)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    return () => {
      track.removeEventListener('pointerdown', down)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
  }, [])

  return (
    <GlassSection id="projects" index="03" title="Projects" variant="slide">
      <div className="mb-5 flex items-center justify-between">
        <p className="font-mono text-xs text-white/50">
          {projects.length} projects · drag or scroll →
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => step(-1)}
            aria-label="Previous project"
            className="rounded border border-white/25 px-3 py-1 font-mono text-sm text-white transition-colors hover:bg-white hover:text-black"
          >
            ←
          </button>
          <button
            onClick={() => step(1)}
            aria-label="Next project"
            className="rounded border border-white/25 px-3 py-1 font-mono text-sm text-white transition-colors hover:bg-white hover:text-black"
          >
            →
          </button>
        </div>
      </div>

      {/* Carousel track */}
      <div
        ref={trackRef}
        onScroll={onScroll}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ cursor: 'grab' }}
      >
        {projects.map((p, i) => (
          <article
            key={p.title}
            className="flex min-h-[300px] w-[86%] shrink-0 snap-center flex-col rounded-2xl border border-white/12 bg-white/[0.02] p-6 sm:w-[440px]"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <span className="font-mono text-3xl font-bold text-white/15">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span
                className={`shrink-0 rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${
                  statusStyle[p.status] ?? statusStyle.Upcoming
                }`}
              >
                {p.status}
              </span>
            </div>

            <h3 className="font-mono text-xl font-bold text-white">{p.title}</h3>
            <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-white/45">
              {p.role} · {p.period}
            </p>

            <p className="mt-4 flex-1 font-mono text-sm leading-relaxed text-white/75">
              {p.description}
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {p.tags.map((t) => (
                <span
                  key={t}
                  className="rounded border border-white/15 px-2 py-0.5 font-mono text-[10px] text-white/60"
                >
                  {t}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>

      {/* Progress dots */}
      <div className="mt-5 flex justify-center gap-2">
        {projects.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Go to project ${i + 1}`}
            className={`h-1.5 rounded-full transition-all ${
              i === active ? 'w-6 bg-white' : 'w-1.5 bg-white/30 hover:bg-white/60'
            }`}
          />
        ))}
      </div>
    </GlassSection>
  )
}
