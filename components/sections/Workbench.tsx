'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { animate, motion, useInView, useMotionValue, useMotionValueEvent, useReducedMotion, useTransform, type AnimationPlaybackControls } from 'motion/react'
import SectionHeading from '@/components/ui/SectionHeading'
import Duck from '@/components/duck/Duck'
import { useTint } from '@/lib/tint'
import { cadGeometry, cadProjects } from '@/data/cad'
import type { Bench, Placement } from '@/components/workbench/engine'

/**
 * THE ENGINEERING WORKBENCH - one CAD model at a time, and the model is the
 * point: it takes the middle of the screen, the words take the edges.
 *
 * The model tells its own story (engine.ts has the stages): sketch,
 * wireframe, surface, assembly, the finished model and - where there is a
 * photograph of the real thing - reality, the photo wiped across the model
 * from left to right along an ink line. It plays by itself once the bench is
 * on screen; the scroll doesn't drive it (scrubbed by the scroll, the bench
 * had to be a sticky box in a tall one, and on a phone that pinned the
 * section under the finger). The rail of stage names jumps to a stage,
 * "View process" plays it again, and with reduced motion the stages step
 * instead of playing.
 *
 * Switching projects folds the current model back into nothing (its lines
 * undraw), loads the next and builds it again from the sketch.
 *
 * Without WebGL, the bench shows the model's ink drawing instead, and the
 * parts as a list: the 3D is never the only way to the information.
 */
const STAGES = ['Sketch', 'Wireframe', 'Surface', 'Assembly', 'Final', 'Reality'] as const
// the story, played: each stage drawn over STEP seconds, then held for HOLD
const STEP = 1.3
const HOLD = 0.45
// where the rail lands for each stage: that stage finished, not just begun
// (the story's value runs 0..5; stage k is told between k and k + 1)
const STAGE_AT = [0.95, 1.95, 2.95, 3.9, 4, 5]

type Sketch = { w: number; h: number; paths: { part: string; d: string }[] }

export default function Workbench() {
  const reduce = !!useReducedMotion()
  const tintRef = useTint<HTMLElement>('workbench')
  const stageRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const tabsRef = useRef<HTMLUListElement>(null)
  const bench = useRef<Bench | null>(null)
  const labelRefs = useRef(new Map<string, HTMLDivElement>())
  const [index, setIndex] = useState(0)
  const [webgl, setWebgl] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [stage, setStage] = useState(0)
  const [manual, setManual] = useState(4) // the stage, when reduced motion steps it
  const [exploded, setExploded] = useState(false)
  const [hover, setHover] = useState<string | null>(null)
  const [turned, setTurned] = useState(false)
  const [ticks, setTicks] = useState<{ id: number; x: number; y: number }[]>([])
  const [asleep, setAsleep] = useState(false)
  const [sketch, setSketch] = useState<Sketch | null>(null)

  const project = cadProjects[index]
  const maxStage = project.photo ? 5 : 4
  const several = project.parts.length > 1

  /* ── the story: played through once the bench is on screen ────────── */
  const story = useMotionValue(0)
  const reveal = useTransform(story, [4, 5], [0, 1], { clamp: true })
  const wipe = useTransform(reveal, (v) => `inset(0 ${(1 - v) * 100}% 0 0)`)
  const wipeAt = useTransform(reveal, (v) => `${v * 100}%`)
  useMotionValueEvent(story, 'change', (v) => {
    if (reduce) return
    bench.current?.setStage(Math.min(v, 4))
    const k = Math.min(maxStage, Math.floor(v + 0.02))
    setStage((s) => (s === k ? s : k))
  })
  const playing = useRef<{ run: number; ctl: AnimationPlaybackControls | null }>({ run: 0, ctl: null })
  const stop = useCallback(() => {
    playing.current.run++
    playing.current.ctl?.stop()
    playing.current.ctl = null
  }, [])
  // from the sketch to the end, stage by stage, each one held a moment
  const play = useCallback(
    async (last: number) => {
      stop()
      const run = playing.current.run
      story.set(0)
      for (let k = 0; k <= last; k++) {
        const ctl = animate(story, STAGE_AT[k], { duration: k === 4 ? 0.4 : k === 5 ? 1.6 : STEP, ease: 'easeInOut' })
        playing.current.ctl = ctl
        await ctl
        if (run !== playing.current.run) return
        await new Promise((r) => setTimeout(r, HOLD * 1000))
        if (run !== playing.current.run) return
      }
      playing.current.ctl = null
    },
    [stop, story],
  )
  useEffect(() => stop, [stop])

  const onScreen = useInView(stageRef, { amount: 0.5 })
  const played = useRef(false)
  useEffect(() => {
    if (reduce || played.current || !onScreen || loading) return
    played.current = true
    play(maxStage)
  }, [onScreen, loading, reduce, play, maxStage])

  /* ── the 3D: started once the bench is near, torn down when it goes ─── */
  const place = useCallback((ps: Placement[]) => {
    for (const p of ps) {
      const el = labelRefs.current.get(p.key)
      if (!el) continue
      // the dot sits on the part; the label at its own place, joined by a leader
      const ox = p.lx - p.x
      const oy = p.ly - p.y
      el.style.transform = `translate(${p.x}px, ${p.y}px)`
      el.style.setProperty('--ox', `${ox}px`)
      el.style.setProperty('--oy', `${oy}px`)
      el.style.setProperty('--len', `${Math.max(0, Math.hypot(ox, oy) - 8)}px`)
      el.style.setProperty('--ang', `${Math.atan2(oy, ox)}rad`)
      // the label hangs off the side it points to
      el.style.setProperty('--side', ox < 0 ? '-100%' : '0%')
    }
  }, [])

  useEffect(() => {
    let live = true
    let ro: ResizeObserver | null = null
    let io: IntersectionObserver | null = null
    ;(async () => {
      const mod = await import('@/components/workbench/engine')
      if (!live) return
      if (!mod.canWebGL()) {
        setWebgl(false)
        setLoading(false)
        return
      }
      const canvas = canvasRef.current
      if (!canvas) return
      let b: Bench
      try {
        b = new mod.Bench(
          canvas,
          {
            onPlace: place,
            onHover: (k) => setHover(k),
            onTurn: () => setTurned(true),
            onLand: (x, y) => {
              const id = Math.random()
              setTicks((t) => [...t.slice(-4), { id, x, y }])
              window.setTimeout(() => setTicks((t) => t.filter((k) => k.id !== id)), 900)
            },
          },
          { reduce },
        )
      } catch {
        setWebgl(false)
        setLoading(false)
        return
      }
      bench.current = b
      setWebgl(true)
      ro = new ResizeObserver(() => b.resize())
      ro.observe(canvas)
      io = new IntersectionObserver(([e]) => b.setVisible(e.isIntersecting), { rootMargin: '100px' })
      io.observe(canvas)
      const first = cadProjects[0]
      await b.load(`/cad/${first.slug}/model.glb`, cadGeometry[first.slug].view)
      if (!live) return
      b.setStage(reduce ? 4 : Math.min(story.get(), 4))
      b.emerge()
      setLoading(false)
    })()
    return () => {
      live = false
      ro?.disconnect()
      io?.disconnect()
      bench.current?.dispose()
      bench.current = null
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // the drawing, for the bench without WebGL
  useEffect(() => {
    if (webgl !== false) return
    let live = true
    fetch(`/cad/${project.slug}/sketch.json`)
      .then((r) => r.json())
      .then((j) => live && setSketch(j))
      .catch(() => {})
    return () => {
      live = false
    }
  }, [webgl, project.slug])

  /* ── switching projects: fold away, load, draw back out ─────────────── */
  const busy = useRef(false)
  const go = useCallback(
    async (i: number) => {
      const n = (i + cadProjects.length) % cadProjects.length
      if (n === index || busy.current) return
      busy.current = true
      setExploded(false)
      setHover(null)
      const b = bench.current
      if (b) {
        b.setExplode(false)
        b.setHighlight(null)
        const next = cadProjects[n]
        const load = fetch(`/cad/${next.slug}/model.glb`).catch(() => null) // warm the cache while it folds
        await b.collapse()
        await load
        setLoading(true)
        setIndex(n)
        stop()
        if (!reduce) story.set(0)
        await b.load(`/cad/${next.slug}/model.glb`, cadGeometry[next.slug].view)
        b.setStage(reduce ? Math.min(STAGE_AT[manual], 4) : 0)
        b.emerge()
        setLoading(false)
        // the new model builds itself from the sketch
        if (!reduce) {
          played.current = true
          play(next.photo ? 5 : 4)
        }
      } else setIndex(n)
      busy.current = false
    },
    [index, manual, reduce, story, stop, play],
  )
  const warm = (i: number) => {
    const n = (i + cadProjects.length) % cadProjects.length
    fetch(`/cad/${cadProjects[n].slug}/model.glb`).catch(() => {})
  }

  // the index scrolls (sideways on a phone, down on a desk): keep the open project's in view
  useEffect(() => {
    const ul = tabsRef.current
    const tab = ul?.children[index] as HTMLElement | undefined
    if (!ul || !tab) return
    const behavior = reduce ? 'auto' : 'smooth'
    if (ul.scrollWidth > ul.clientWidth) {
      if (tab.offsetLeft < ul.scrollLeft || tab.offsetLeft + tab.offsetWidth > ul.scrollLeft + ul.clientWidth) ul.scrollTo({ left: tab.offsetLeft - 16, behavior })
    } else if (ul.scrollHeight > ul.clientHeight) {
      if (tab.offsetTop < ul.scrollTop || tab.offsetTop + tab.offsetHeight > ul.scrollTop + ul.clientHeight) ul.scrollTo({ top: tab.offsetTop - 8, behavior })
    }
  }, [index, reduce])

  /* ── the rail: jump the story to a stage ────────────────────────────── */
  const goStage = (k: number) => {
    if (reduce) {
      setManual(k)
      setStage(k)
      bench.current?.setStage(Math.min(STAGE_AT[k], 4))
      reveal.set(k >= 5 ? 1 : 0)
      return
    }
    stop()
    played.current = true
    playing.current.ctl = animate(story, Math.min(STAGE_AT[k], maxStage), { duration: 0.9, ease: 'easeInOut' })
  }
  useEffect(() => {
    if (reduce) {
      setStage(manual)
      bench.current?.setStage(Math.min(STAGE_AT[manual], 4))
    }
  }, [reduce, manual])

  useEffect(() => {
    bench.current?.setExplode(exploded)
  }, [exploded])
  useEffect(() => {
    bench.current?.setHighlight(hover)
  }, [hover])

  // the duck dozes off under the bench when nobody touches it
  useEffect(() => {
    if (reduce) return
    let id = window.setTimeout(() => setAsleep(true), 25000)
    const wake = () => {
      setAsleep(false)
      clearTimeout(id)
      id = window.setTimeout(() => setAsleep(true), 25000)
    }
    const el = stageRef.current
    el?.addEventListener('pointermove', wake)
    el?.addEventListener('focusin', wake)
    return () => {
      clearTimeout(id)
      el?.removeEventListener('pointermove', wake)
      el?.removeEventListener('focusin', wake)
    }
  }, [reduce])

  // phones turn by finger, desktops by mouse
  const [touch, setTouch] = useState(false)
  useLayoutEffect(() => setTouch(window.matchMedia('(hover: none)').matches), [])

  const meta = [
    project.tool,
    `${project.parts.length} ${project.parts.length === 1 ? 'component' : 'components'}`,
    project.iterations ? `${project.iterations} iterations` : null,
    project.kind,
    project.year,
  ].filter(Boolean)
  const hovered = project.parts.find((p) => p.key === hover)
  const prevProject = cadProjects[(index - 1 + cadProjects.length) % cadProjects.length]
  const nextProject = cadProjects[(index + 1) % cadProjects.length]
  const num = (i: number) => String(i + 1).padStart(2, '0')

  return (
    <section ref={tintRef} id="workbench" aria-labelledby="workbench-title" className="relative isolate overflow-x-clip">
      <div className="mx-auto w-full max-w-[92.5rem] px-[clamp(16px,4vw,64px)] pt-16 sm:pt-24">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-10">
          <SectionHeading className="!mb-0" index="05" label="Engineering Workbench" command="cd ~/workbench" subtitle="From sketch → constraint → CAD → something that actually exists." />
          <TitleBlock />
        </div>
      </div>

      <div
        ref={stageRef}
        className="mx-auto grid w-full max-w-[92.5rem] gap-x-8 gap-y-4 px-[clamp(16px,4vw,64px)] pb-10 pt-8 sm:pt-10 lg:h-svh lg:min-h-[40rem] lg:grid-cols-[16rem_minmax(0,1fr)] lg:pb-7 lg:pt-[4.75rem] xl:grid-cols-[18.5rem_minmax(0,1fr)]"
      >
        {/* ── the index of drawings: a column on a desk, a strip on a phone ── */}
        <aside className="flex min-h-0 min-w-0 flex-col">
          <p id="workbench-title" className="m-0 mb-2 flex items-baseline justify-between font-mono text-[0.6875rem] uppercase tracking-[0.04em] text-fg-muted th:tracking-normal">
            <span>
              <span className="font-bold text-fg">Drawings</span> · pick one
            </span>
            <span className="tabular-nums">{cadProjects.length}</span>
          </p>
          <ul
            ref={tabsRef}
            aria-label="CAD projects"
            className="relative m-0 -mx-1 flex list-none gap-1.5 overflow-x-auto p-1 [scrollbar-width:none] lg:mx-0 lg:min-h-0 lg:flex-1 lg:flex-col lg:gap-0 lg:overflow-y-auto lg:overflow-x-visible lg:border-y lg:border-fg/15 lg:p-0 lg:[scrollbar-width:thin]"
          >
            {cadProjects.map((p, i) => {
              const on = i === index
              const thumb = `url(/cad/${p.slug}/thumb.svg)`
              return (
                <li key={p.slug} className="shrink-0 lg:border-b lg:border-fg/10 lg:last:border-b-0">
                  <button
                    type="button"
                    onClick={() => go(i)}
                    onPointerEnter={() => warm(i)}
                    aria-current={on ? 'true' : undefined}
                    className={`relative flex w-full items-center gap-2 rounded-[3px] border py-1 pl-1 pr-3 text-left transition-colors focus-visible:outline-solid focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-fg lg:gap-3 lg:rounded-none lg:border-0 lg:py-2 lg:pl-3 lg:pr-2 ${on ? 'border-fg bg-[#fbf9f3] text-fg' : 'border-fg/15 text-fg-muted hover:border-fg/45 hover:text-fg lg:hover:bg-fg/[0.04]'}`}
                  >
                    {on && <span aria-hidden className="absolute inset-x-1 -bottom-px h-[3px] bg-accent lg:inset-x-auto lg:inset-y-1 lg:bottom-auto lg:left-0 lg:h-auto lg:w-[3px]" />}
                    <span className="hidden w-5 shrink-0 font-mono text-[0.625rem] tabular-nums text-fg-dim lg:block">{num(i)}</span>
                    <span
                      aria-hidden
                      className="h-7 w-8 shrink-0 bg-current lg:h-8 lg:w-10"
                      style={{ maskImage: thumb, WebkitMaskImage: thumb, maskSize: 'contain', WebkitMaskSize: 'contain', maskRepeat: 'no-repeat', WebkitMaskRepeat: 'no-repeat', maskPosition: 'center', WebkitMaskPosition: 'center' }}
                    />
                    <span className="min-w-0 flex-1 truncate whitespace-nowrap font-mono text-[0.6875rem] font-bold uppercase tracking-[0.03em] th:tracking-normal lg:text-[0.75rem]">{p.name}</span>
                    {p.year && <span className="hidden shrink-0 font-mono text-[0.625rem] tabular-nums text-fg-dim lg:block">{p.year}</span>}
                  </button>
                </li>
              )
            })}
          </ul>

          {/* the duck, with a ruler, minding the drawings */}
          <div aria-hidden className="pointer-events-none mt-4 hidden items-end gap-1 lg:flex">
            {asleep ? <Duck pose="sleep" width={78} /> : <Duck pose="stand" width={46} />}
            <svg viewBox="0 0 120 22" className="mb-1 w-[6.5rem]">
              <rect x="1" y="4" width="118" height="14" fill="#fbf9f3" stroke="#111" strokeWidth="1.4" />
              {Array.from({ length: 12 }, (_, i) => (
                <path key={i} d={`M${6 + i * 10} 4V${i % 5 === 0 ? 12 : 8}`} stroke="#111" strokeWidth="1" />
              ))}
            </svg>
          </div>
        </aside>

        <div className="flex min-h-0 min-w-0 flex-col">
          {/* ── the top edge: which stage, and the way to the next drawing ── */}
          <div className="flex items-center justify-between gap-4">
            <ol className="m-0 flex min-w-0 list-none items-center gap-0 overflow-x-auto p-0 font-mono text-[0.6875rem] uppercase tracking-[0.03em] [scrollbar-width:none] th:tracking-normal">
              {STAGES.slice(0, maxStage + 1).map((s, k) => (
                <li key={s} className="flex shrink-0 items-center">
                  {k > 0 && <span aria-hidden className={`mx-1 h-px w-2.5 sm:mx-1.5 sm:w-5 ${k <= stage ? 'bg-fg' : 'bg-fg/20'}`} />}
                  <button
                    type="button"
                    onClick={() => goStage(k)}
                    aria-current={k === stage ? 'step' : undefined}
                    className={`whitespace-nowrap py-1.5 transition-colors focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-fg ${k === stage ? 'text-fg' : k < stage ? 'text-fg-muted' : 'text-fg-dim hover:text-fg-muted'}`}
                  >
                    {k === stage && <span aria-hidden className="mr-1 inline-block h-1.5 w-1.5 -translate-y-px rounded-full bg-accent-text" />}
                    {s}
                  </button>
                </li>
              ))}
            </ol>
            <div className="hidden shrink-0 items-center gap-1.5 font-mono sm:flex">
              <button
                type="button"
                onClick={() => go(index - 1)}
                onPointerEnter={() => warm(index - 1)}
                aria-label={`Previous project: ${prevProject.name}`}
                className="grid h-9 w-9 place-items-center rounded-full border border-fg/25 text-[1rem] text-fg transition-colors hover:border-fg focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-fg"
              >
                ←
              </button>
              <span aria-hidden className="hidden w-14 text-center text-[0.6875rem] tabular-nums text-fg-muted sm:block">
                {num(index)} / {cadProjects.length}
              </span>
              <button
                type="button"
                onClick={() => go(index + 1)}
                onPointerEnter={() => warm(index + 1)}
                aria-label={`Next project: ${nextProject.name}`}
                className="grid h-9 w-9 place-items-center rounded-full border border-fg/25 text-[1rem] text-fg transition-colors hover:border-fg focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-fg"
              >
                →
              </button>
            </div>
          </div>

          {/* ── the model ─────────────────────────────────────────── */}
          <div className="relative mt-2 h-[min(62svh,30rem)] min-h-0 sm:h-[60svh] lg:h-auto lg:flex-1">
            <canvas
              ref={canvasRef}
              aria-label={`${project.name}: a 3D model you can turn by dragging`}
              role="img"
              className={`absolute inset-0 h-full w-full ${touch ? 'touch-pan-y' : ''} ${webgl === false ? 'hidden' : 'cursor-grab active:cursor-grabbing'}`}
            />

            {/* no WebGL: the drawing instead */}
            {webgl === false && sketch && (
              <svg viewBox={`0 0 ${sketch.w} ${sketch.h}`} role="img" aria-label={`${project.name}, drawn`} className="absolute inset-0 h-full w-full p-6">
                {sketch.paths.map((s) => (
                  <path key={s.part} d={s.d} fill="none" stroke="#111" strokeWidth={Math.max(sketch.w, sketch.h) / 600} strokeLinecap="round" />
                ))}
              </svg>
            )}

            {loading && webgl !== false && (
              <p className="pointer-events-none absolute inset-0 grid place-items-center font-mono text-[0.75rem] uppercase tracking-[0.06em] text-fg-dim">
                unpacking the model…
              </p>
            )}

            {/* the exploded view's labels, placed by the engine every frame they move */}
            {several &&
              project.parts.map((part) => {
                const on = exploded || hover === part.key
                return (
                  <div
                    key={`${project.slug}-${part.key}`}
                    ref={(el) => {
                      if (el) labelRefs.current.set(part.key, el)
                      else labelRefs.current.delete(part.key)
                    }}
                    aria-hidden
                    className="pointer-events-none absolute left-0 top-0"
                    // the label being read sits over its neighbours
                    style={{ opacity: on && stage >= 3 ? 1 : 0, transition: 'opacity .25s', zIndex: hover === part.key ? 12 : 10 }}
                  >
                    {/* the dot on the part, and the leader out to the label */}
                    <span className="absolute -left-[3px] -top-[3px] h-[6px] w-[6px] rounded-full bg-[#111]" />
                    <span className="absolute left-0 top-0 h-px origin-left bg-[#111]" style={{ width: 'var(--len)', transform: 'rotate(var(--ang))' }} />
                    <span
                      className="absolute w-max max-w-[13rem] rounded-[2px] bg-[#fbf9f3]/90 px-1.5 py-0.5"
                      style={{ transform: 'translate(calc(var(--ox) + var(--side)), calc(var(--oy) - 50%))' }}
                    >
                      <span className={`block font-mono text-[0.75rem] font-bold uppercase tracking-[0.04em] th:tracking-normal ${hover === part.key ? 'text-accent-text' : 'text-fg'}`}>{part.label}</span>
                      {hover === part.key && (
                        <span className="mt-1 block font-hand text-[0.9375rem] leading-snug text-fg">
                          {part.notes.map((n) => (
                            <span key={n} className="block">
                              {n}
                            </span>
                          ))}
                        </span>
                      )}
                    </span>
                  </div>
                )
              })}

            {/* a tick where a part has just gone home */}
            {ticks.map((t) => (
              <svg key={t.id} aria-hidden viewBox="0 0 24 24" className="pointer-events-none absolute z-10 h-6 w-6 -translate-x-1/2 -translate-y-1/2" style={{ left: t.x, top: t.y }}>
                <motion.path
                  d="M4 13 L10 18 L20 5"
                  fill="none"
                  stroke="rgb(var(--accent-text))"
                  strokeWidth={2.6}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0, opacity: 1 }}
                  animate={{ pathLength: 1, opacity: [1, 1, 0] }}
                  transition={{ duration: 0.85, times: [0, 0.6, 1] }}
                />
              </svg>
            ))}

            {/* reality: the photograph, wiped across along an ink line */}
            {project.photo && (
              <>
                <motion.div style={{ clipPath: reduce ? (stage >= 5 ? 'none' : 'inset(0 100% 0 0)') : wipe }} className="pointer-events-none absolute inset-0 z-[5]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={project.photo.src} alt={project.photo.alt} loading="lazy" className="h-full w-full object-contain" />
                </motion.div>
                {!reduce && <motion.span aria-hidden style={{ left: wipeAt, opacity: reveal }} className="pointer-events-none absolute inset-y-[8%] z-[6] w-[2px] bg-[#111]" />}
              </>
            )}

            {/* on a phone the arrows sit at the model's bottom corners */}
            <button
              type="button"
              onClick={() => go(index - 1)}
              aria-label={`Previous project: ${prevProject.name}`}
              className="absolute bottom-0 left-0 z-[8] grid h-9 w-9 place-items-center rounded-full border border-fg/25 bg-bg font-mono text-[1rem] text-fg sm:hidden"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => go(index + 1)}
              aria-label={`Next project: ${nextProject.name}`}
              className="absolute bottom-0 right-0 z-[8] grid h-9 w-9 place-items-center rounded-full border border-fg/25 bg-bg font-mono text-[1rem] text-fg sm:hidden"
            >
              →
            </button>

            {/* how to turn it, until it has been turned */}
            {webgl && (
              <p
                aria-hidden
                className="pointer-events-none absolute bottom-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[0.6875rem] uppercase tracking-[0.06em] text-fg-dim transition-opacity duration-500"
                style={{ opacity: turned || loading ? 0 : 1 }}
              >
                {touch ? 'drag sideways to turn' : 'drag to rotate'}
              </p>
            )}
          </div>

          {/* ── the bottom edge: what it is, and what you can do ──── */}
          <div className="mt-4 grid gap-4 border-t border-fg/15 pt-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
            <div className="min-w-0">
              <h3 className="font-sans text-[1.375rem] font-bold uppercase leading-tight tracking-[0.02em] text-fg sm:text-[1.75rem]">
                <span className="mr-2 font-mono text-[0.75rem] font-normal tabular-nums text-fg-dim sm:text-[0.875rem]">{num(index)}</span>
                {project.name}
              </h3>
              <p className="mt-1 font-mono text-[0.75rem] text-fg-muted">{meta.join('  ·  ')}</p>
              <p className="mt-2 max-w-[38rem] font-sans text-[0.9375rem] leading-relaxed text-fg/85 lg:line-clamp-3">{project.blurb}</p>
              {/* the parts, readable without hovering anything */}
              {several && (
                <ul className="m-0 mt-2 flex list-none flex-wrap gap-x-4 gap-y-1 p-0" aria-label="Parts">
                  {project.parts.map((part) => (
                    <li key={part.key}>
                      <button
                        type="button"
                        onPointerEnter={() => setHover(part.key)}
                        onPointerLeave={() => setHover(null)}
                        onFocus={() => setHover(part.key)}
                        onBlur={() => setHover(null)}
                        aria-label={`${part.label}: ${part.notes.join('; ')}`}
                        className={`font-mono text-[0.6875rem] uppercase tracking-[0.03em] underline-offset-4 th:tracking-normal sm:text-[0.75rem] ${hover === part.key ? 'text-accent-text underline' : 'text-fg-dim hover:text-fg'}`}
                      >
                        {part.label}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {hovered && <p className="sr-only" aria-live="polite">{`${hovered.label}: ${hovered.notes.join('. ')}`}</p>}
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[0.75rem] uppercase tracking-[0.03em] th:tracking-normal">
              {several ? (
                <button
                  type="button"
                  onClick={() => {
                    if (stage < 4) goStage(4)
                    setExploded((e) => !e)
                  }}
                  aria-pressed={exploded}
                  disabled={webgl === false}
                  className={`rounded-[3px] px-3 py-2 transition-colors focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg disabled:opacity-40 ${exploded ? 'bg-accent text-[#111]' : 'bg-[#111] text-[rgb(var(--bg))] hover:opacity-85'}`}
                >
                  {exploded ? 'Put it together' : 'Explode model'}
                </button>
              ) : (
                <span className="font-hand text-[0.9375rem] normal-case tracking-normal text-fg-muted">one piece. nothing to take apart.</span>
              )}
              <button type="button" onClick={() => (reduce ? goStage(0) : play(maxStage))} className="py-2 text-fg underline-offset-4 hover:underline focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-fg">
                View process
              </button>
              {webgl && (
                <button type="button" onClick={() => bench.current?.resetView()} className="py-2 text-fg-muted underline-offset-4 hover:text-fg hover:underline focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-fg">
                  Reset view
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/**
 * The heading's other half: a drawing's title block, filled in from the
 * bench itself (how many drawings, how many parts, which tools, which years).
 */
function TitleBlock() {
  const parts = cadProjects.reduce((n, p) => n + p.parts.length, 0)
  const tools = [...new Set(cadProjects.map((p) => p.tool).filter((t) => t !== 'CAD'))]
  const years = cadProjects.map((p) => p.year).filter(Boolean).sort() as string[]
  const span = years.length ? (years[0] === years[years.length - 1] ? years[0] : `${years[0]}–${years[years.length - 1]}`) : '—'
  // [label, value, wide]
  const cells: [string, string, boolean?][] = [
    ['Drawings', String(cadProjects.length)],
    ['Parts', String(parts)],
    ['Dates', span],
    ['Tools', tools.join(' · '), true],
    ['Drawn by', 'N. Saechua'],
  ]
  return (
    <dl className="m-0 grid w-full grid-cols-3 border-l border-t border-fg font-mono lg:w-[26rem]">
      {cells.map(([k, v, wide]) => (
        <div key={k} className={`min-w-0 ${wide ? 'col-span-2' : ''} border-b border-r border-fg px-2.5 py-1.5 sm:px-3 sm:py-2`}>
          <dt className="text-[0.5625rem] uppercase tracking-[0.04em] text-fg-dim sm:text-[0.625rem]">{k}</dt>
          <dd className="m-0 mt-0.5 truncate text-[0.75rem] font-bold text-fg sm:text-[0.8125rem]">{v}</dd>
        </div>
      ))}
    </dl>
  )
}
