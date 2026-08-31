'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, useMotionValueEvent, useReducedMotion, useScroll } from 'framer-motion'
import AsciiImage from '@/components/effects/AsciiImage'
import ProjectWall from '@/components/effects/ProjectWall'
import { figletFor } from '@/data/figlets'
import { projects, type Project } from '@/data/portfolio'

/**
 * PROJECTS - a film of nine screens, and scroll is the only control.
 *
 * The section is one viewport tall per project. A stage stays pinned while
 * the page scrolls through it, and how far you have scrolled decides which
 * project is on the stage. No tabs, no arrows, nothing to learn: the reader
 * is already scrolling, so the projects simply arrive in turn, each with the
 * whole screen to itself - block-letter title, a screenshot big enough to
 * read, the verified contribution line - instead of a card's worth.
 *
 * The filmstrip along the bottom is the table of contents the grid used to
 * be: all nine at once, so nobody scrolls blind wondering how many are left,
 * and a click on a thumb is nothing more than a scroll to that project's slot.
 *
 * Every arrival animates by REMOUNTING (key={index}) with initial/animate,
 * never framer's exit-animation wrapper: its exits do not settle in this
 * project and have twice left invisible elements over the page swallowing
 * clicks. A remount has no exit; the previous screen is simply gone.
 *
 * This replaced a grid of nine browser-window cards, which read as a wall at
 * a glance and turned every screenshot into a thumbnail.
 */

// ---- dials -----------------------------------------------------------------
const FIGLET_COLS = 46 // widest title in data/figlets.ts: one size for all nine
const GLYPH_W = 0.6 // JetBrains Mono advance width as a share of font-size
const FIGLET_MAX_PX = 18 // so the block letters never dwarf the title on a wide screen
const MOBILE_TAGS = 4 // tags shown below lg
const CLIP_HIDDEN = 'inset(0 100% 0 0)' // figlet wipe: covered from the right...
const CLIP_SHOWN = 'inset(0 0% 0 0)' // ...to fully uncovered
const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1]
// -----------------------------------------------------------------------------

const statusStyle: Record<string, string> = {
  // Live reads brightest: a product anyone can open right now outranks one
  // that is merely finished
  Live: 'border-emerald-300/70 text-emerald-200',
  Completed: 'border-white/40 text-white/80',
  'In Progress': 'border-white/25 text-white/60',
  Upcoming: 'border-white/15 text-white/45',
}

// the "nothing to render" panel for projects without a screenshot
const DOTS = {
  backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.10) 1px, transparent 1px)',
  backgroundSize: '14px 14px',
}

const pad = (n: number) => String(n).padStart(2, '0')
const total = projects.length

export default function Projects() {
  const reduce = useReducedMotion()
  const [still, setStill] = useState(false)
  useEffect(() => setStill(!!reduce), [reduce])

  const sectionRef = useRef<HTMLElement>(null)
  const [index, setIndex] = useState(0)

  // The whole site mounts at once behind the boot screen, so without a gate
  // project 0 would play its arrival while the section is still far below the
  // fold and greet the reader already finished. Arm on first sight instead:
  // the animated subtree is keyed on `armed`, so arming remounts it and the
  // first arrival plays exactly when the section is reached.
  const [armed, setArmed] = useState(false)
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setArmed(true)
          io.disconnect()
        }
      },
      { threshold: 0.15 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // 0 when the section's top meets the viewport's top, 1 when its bottom
  // meets the viewport's bottom: the (n - 1) viewports of travel during which
  // the stage is pinned. Project i owns the slot centred on i / (n - 1).
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] })
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    // setState with an unchanged value bails out before rendering, so this
    // re-renders once per project, not once per pixel
    setIndex(Math.min(total - 1, Math.max(0, Math.round(v * (total - 1)))))
  })

  // a thumb click is a scroll to that project's slot. The slot is derived the
  // same way useScroll derives progress - travel is section height minus the
  // viewport, NOT height / total - so a click lands exactly where the index
  // formula says that project lives, even when the browser chrome on a phone
  // makes the viewport taller than 100svh.
  const goTo = useCallback(
    (i: number) => {
      const el = sectionRef.current
      if (!el) return
      const top = el.getBoundingClientRect().top + window.scrollY
      const travel = el.offsetHeight - document.documentElement.clientHeight
      window.scrollTo({
        top: top + (i / (total - 1)) * travel,
        behavior: still ? 'auto' : 'smooth',
      })
    },
    [still],
  )

  // the figlet is FIGLET_COLS glyphs wide; size it so those columns fit the
  // text column, whatever the viewport. Observed on the stable wrapper, not
  // the remounting screen, so the observer survives every arrival.
  const colRef = useRef<HTMLDivElement>(null)
  const [figletPx, setFigletPx] = useState<number | null>(null)
  useEffect(() => {
    const col = colRef.current
    if (!col) return
    const ro = new ResizeObserver(([entry]) => {
      setFigletPx(Math.min(FIGLET_MAX_PX, entry.contentRect.width / FIGLET_COLS / GLYPH_W))
    })
    ro.observe(col)
    return () => ro.disconnect()
  }, [])

  const p = projects[index]

  // initial={false} before arming and under reduced motion: framer renders
  // the animate state outright, so the screen is complete on its first frame
  const animate = armed && !still
  const arrivalKey = `${armed}:${index}`
  const fade = {
    initial: animate ? { opacity: 0, y: 8 } : false,
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.35, ease: EASE_OUT },
  } as const
  const wipe = {
    initial: animate ? { clipPath: CLIP_HIDDEN } : false,
    animate: { clipPath: CLIP_SHOWN },
    transition: { duration: 0.5, ease: EASE_OUT },
  } as const

  return (
    <section
      ref={sectionRef}
      id="projects"
      // scroll-mt-0: the header's scrollIntoView must land on the section's
      // very top, which is project 0
      className="relative scroll-mt-0"
      style={{ height: `${total * 100}svh` }}
    >
      {/* the stage: pinned for the whole section. pt clears the fixed header;
          isolate keeps the wall's -z-10 inside the stage */}
      <div className="sticky top-0 isolate flex h-[100svh] flex-col overflow-hidden px-4 pt-20 sm:px-6 lg:pt-24">
        <ProjectWall />

        {/* header: the GlassSection markup verbatim, so this matches every
            other section even though it cannot be one */}
        <div className="relative mb-7 flex items-baseline gap-3 pb-4">
          <motion.span
            initial={reduce ? { opacity: 0 } : { opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="font-mono text-xs text-white/40"
          >
            03
          </motion.span>
          <motion.h2
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: 0.22 }}
            className="font-mono text-lg font-bold uppercase tracking-[0.2em] text-white txt-glow sm:text-xl"
          >
            Projects
          </motion.h2>
          {/* underline grows in */}
          <motion.span
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-x-0 bottom-0 h-px origin-left bg-white/10"
          />
        </div>

        {/* a room-sized index numeral behind everything: depth, and you always
            know where you are in the film even between glances at the rail */}
        <motion.span
          key={`ghost:${arrivalKey}`}
          aria-hidden
          initial={animate ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: EASE_OUT }}
          className="pointer-events-none absolute bottom-[6vh] left-[-1vw] -z-10 select-none font-mono text-[38vh] font-bold leading-none text-white/[0.05]"
        >
          {pad(index + 1)}
        </motion.span>

        {/* the screen: image over text on a phone, text beside image from lg.
            min-h-0 + overflow-hidden so a tall screen can never push the rail
            off the stage; "safe center" keeps a too-tall column top-aligned
            instead of clipping its head under the header */}
        <div className="grid min-h-0 flex-1 grid-cols-1 content-start gap-3 overflow-hidden [@media(max-height:520px)]:grid-cols-2 [@media(max-height:520px)]:items-start [@media(max-height:520px)]:gap-5 [@media(max-height:520px)]:overflow-y-auto lg:grid-cols-2 lg:content-stretch lg:gap-10 lg:[align-items:safe_center]">
          {/* text LEFT, screenshot RIGHT from lg; the image leads on a phone
              held upright. A rotated phone is short but WIDE, so it gets the
              two-column layout too - stacked, nothing fit above the fold */}
          <div className="order-first mx-auto w-full max-w-[calc(28svh*1.6)] [@media(max-height:520px)]:order-last [@media(max-height:520px)]:max-w-[calc(52svh*1.6)] lg:order-last lg:ml-0 lg:max-w-[calc(56svh*1.6)]">
            <Screen key={arrivalKey} p={p} />
          </div>

          <div ref={colRef} className="min-w-0">
            <motion.div key={arrivalKey} {...fade}>
              {/* block letters: the short word, wiped in left to right. The
                  h3 below carries the full title, so this is decoration */}
              <motion.pre
                key={arrivalKey}
                aria-hidden
                {...wipe}
                style={{
                  ...(figletPx ? { fontSize: figletPx } : null),
                  textShadow: '0 0 14px rgba(255,255,255,0.3), 0 0 34px rgba(255,255,255,0.12)',
                }}
                className="m-0 whitespace-pre font-mono text-[13px] leading-[1.1] text-white lg:text-[18px]"
              >
                {figletFor(p.title)}
              </motion.pre>

              <h3 className="mt-3 font-sans text-[15px] font-semibold leading-snug text-white lg:mt-4 lg:text-xl">
                {p.title}
              </h3>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                <p className="font-mono text-[10px] uppercase tracking-wider text-white/40 lg:text-[11px]">
                  {p.role} · {p.period}
                </p>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider ${
                    statusStyle[p.status] ?? statusStyle.Upcoming
                  }`}
                >
                  {p.status === 'Live' && (
                    <span aria-hidden className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60 motion-reduce:hidden" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    </span>
                  )}
                  {p.status}
                </span>
              </div>

              {/* sans, not mono: a paragraph, and the meta around it already
                  carries the terminal voice. Clamped on a phone, where the
                  stage has 700px to spend on everything */}
              <p className="mt-2 line-clamp-4 font-sans text-[13px] leading-normal text-white/70 lg:mt-3 lg:line-clamp-none lg:text-[14px] lg:leading-relaxed">
                {p.description}
              </p>

              <div className="mt-2 flex flex-wrap gap-1.5 lg:mt-4">
                {p.tags.map((t, i) => (
                  <span
                    key={t}
                    className={`rounded border border-white/[0.12] px-1.5 py-0.5 font-mono text-[10px] text-white/50 ${
                      i >= MOBILE_TAGS ? 'hidden lg:inline-block' : ''
                    }`}
                  >
                    {t}
                  </span>
                ))}
              </div>

              {/* counted off GitHub, not asserted - it sits with the source
                  link because it is the same kind of claim: checkable.
                  Desktop only; the phone stage has no room for it */}
              {p.contribution && (
                <p className="mt-3 hidden font-mono text-[10px] leading-relaxed text-white/50 lg:block">
                  {p.contribution}
                </p>
              )}

              {(p.demo || p.repo) && (
                <div className="mt-2 flex flex-wrap items-center gap-x-4 lg:mt-4">
                  {p.demo && <Link href={p.demo} label="Live demo" />}
                  {p.repo && <Link href={p.repo} label="Source" />}
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* what just arrived, for ears instead of eyes: the stage swaps by
            remount, which announces nothing on its own */}
        <div aria-live="polite" className="sr-only">
          Project {index + 1} of {total}: {p.title}
        </div>

        {/* the rail: where you are, and the whole film at a glance. On a phone
            the filmstrip wraps onto its own line under the counter */}
        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-white/10 pb-3 pt-2 lg:pb-6 lg:pt-4">
          <span className="font-mono text-[11px] tabular-nums text-white/60">
            {pad(index + 1)}/{pad(total)}
          </span>

          <div aria-hidden className="flex flex-1 gap-1 lg:w-28 lg:flex-none">
            {projects.map((_, i) => (
              <span
                key={i}
                className={`h-[3px] flex-1 rounded-sm transition-colors ${i <= index ? 'bg-white/80' : 'bg-white/15'}`}
              />
            ))}
          </div>

          {/* invisible rather than hidden on the last project, so the rail
              does not reflow when the hint goes */}
          <span
            aria-hidden
            className={`font-mono text-[10px] uppercase tracking-wider text-white/30 lg:order-last ${
              index === total - 1 ? 'invisible' : ''
            }`}
          >
            &#8595; scroll
          </span>

          <div
            role="group"
            aria-label="Project filmstrip"
            className="flex basis-full gap-1 lg:basis-auto lg:flex-1 lg:justify-center lg:gap-1.5"
          >
            {projects.map((q, i) => {
              const on = i === index
              return (
                <button
                  key={q.title}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`${pad(i + 1)} ${q.title}`}
                  aria-current={on ? 'true' : undefined}
                  className={`group/t relative aspect-[16/10] min-w-0 flex-1 overflow-hidden rounded-[3px] border border-white/10 bg-black/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white lg:w-[72px] lg:flex-none ${
                    on ? 'ring-1 ring-white' : ''
                  }`}
                >
                  {/* the dimming lives on the picture, not the button: an
                      outline is painted inside the element's own opacity
                      layer, and a 40% focus ring is no focus ring */}
                  {q.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={q.image}
                      alt=""
                      loading="lazy"
                      draggable={false}
                      className={`h-full w-full object-cover object-top transition-opacity ${
                        on ? '' : 'opacity-40 group-hover/t:opacity-75'
                      }`}
                    />
                  ) : (
                    <span
                      className={`block h-full w-full transition-opacity ${on ? '' : 'opacity-40 group-hover/t:opacity-75'}`}
                      style={{ ...DOTS, backgroundSize: '6px 6px' }}
                    />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

/** The screenshot, developing out of ASCII on arrival - or the dotted panel. */
function Screen({ p }: { p: Project }) {
  const frame =
    'aspect-[16/10] w-full overflow-hidden rounded-xl border border-white/[0.12] bg-black/60 shadow-[0_50px_140px_-50px_rgba(0,0,0,0.95),0_0_60px_-20px_rgba(255,255,255,0.07)]'
  if (!p.image) {
    return (
      <div className={`flex flex-col items-center justify-center gap-2 px-4 text-center ${frame}`} style={DOTS}>
        <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-white/45">
          {p.tags.slice(0, 3).join(' / ')}
        </span>
        <span className="font-mono text-[10px] text-white/25">nothing to render</span>
      </div>
    )
  }
  // AsciiImage restarts its develop whenever src changes, which is exactly
  // once per arrival: the index changes, the src changes
  return <AsciiImage src={p.image} alt={`${p.title} screenshot`} className={frame} />
}

function Link({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="group/l font-mono text-[10px] uppercase tracking-wider text-white/55 transition-colors hover:text-white lg:text-[11px]"
    >
      <span aria-hidden>&#8599;</span>{' '}
      <span className="underline-offset-2 group-hover/l:underline">{label}</span>
    </a>
  )
}
