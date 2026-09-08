'use client'

import { useSyncExternalStore } from 'react'
import { motion, useReducedMotion, type Transition } from 'motion/react'
import InkArrow from '@/components/ui/InkArrow'
import { ui } from '@/data/ui'
import { useLang } from '@/lib/use-lang'

/**
 * The hero's "there is more below" sign, in four drafts.
 *
 * Four designs were built against the same brief and none of them was
 * obviously wrong, so rather than argue them out on screenshots they all
 * live here and the page picks one. `?cue=a|b|c|d` swaps it on the real
 * hero - the real fonts, the real paper, the real portrait underneath it -
 * which is the only place the question can actually be settled. When it is,
 * DEFAULT becomes the answer and the other three branches come out; each is
 * self-contained, so deleting one is deleting one case and its comment.
 *
 *   a  the prompt      $ scroll --explore ▋
 *   b  the ink arrow   a drawn arrow in InkBubble's pen
 *   c  the rail        a mark falling down a hairline, no glyph
 *   d  the wheel       a mouse in the page's own ink weight
 */
export type CueVariant = 'a' | 'b' | 'c' | 'd'

const DEFAULT: CueVariant = 'b' // settled: the ink arrow
const VARIANTS: readonly CueVariant[] = ['a', 'b', 'c', 'd']

/**
 * Read from window rather than useSearchParams: this page is otherwise fully
 * static, and reading search params through next/navigation opts the whole
 * route into dynamic rendering for the sake of a comparison switch.
 *
 * useSyncExternalStore rather than an effect, because that is exactly the
 * shape of this - a value that lives outside React and is read, never set.
 * The server has no URL to read, so it renders DEFAULT and hydration matches
 * it; the client snapshot lands on the same commit. subscribe() returns a
 * no-op unsubscribe: the query string cannot change without a navigation
 * that remounts this anyway, so there is nothing to listen to.
 */
const subscribe = () => () => {}
const serverVariant = (): CueVariant => DEFAULT
const clientVariant = (): CueVariant => {
  const q = new URLSearchParams(window.location.search).get('cue')?.toLowerCase()
  return q && (VARIANTS as readonly string[]).includes(q) ? (q as CueVariant) : DEFAULT
}

function useCueVariant(): CueVariant {
  return useSyncExternalStore(subscribe, clientVariant, serverVariant)
}

/* The wheel's fall, written as three moves rather than one loop. It fades in
   at the top of the mouse and holds for a beat, drops on a curve that starts
   gently and gathers speed, then lets go before the floor - decelerating
   while it fades, the way a pen lifts off paper, instead of landing on
   something. The pause between repeats is doing work too: half a second of
   empty mouse reads as the same gesture being made again, where a seamless
   loop reads as a spinner, and a spinner is the one thing a cue at the
   bottom of a hero must not look like. */
const fall = { y: [0, 0, 12, 14], opacity: [0, 1, 1, 0] }
const fallTiming: Transition = {
  duration: 2.6,
  times: [0, 0.16, 0.78, 1],
  ease: ['easeOut', [0.45, 0, 0.75, 0.35], 'easeOut'],
  repeat: Infinity,
  repeatDelay: 0.45,
  delay: 1.5,
}

/* Each design wants a different box. The prompt is one baseline-aligned row;
   the other three stack a label against a mark. The drawn cues stand ~32px
   where the prompt is a single 11px line, and they pay for it out of the
   gradient's runway (pt-8/pb-4) rather than off the orb above them - below
   lg this bar sits on Sky's face, and a 360x780 phone is already a screen
   and a third short of this hero. */
const BOX: Record<CueVariant, string> = {
  a: 'items-baseline justify-center pb-5 pt-10 font-mono text-[0.6875rem]',
  b: 'flex-col items-center gap-1.5 pb-5 pt-10 font-mono text-[0.6875rem] text-fg-dim',
  c: 'flex-col items-center gap-2 pb-4 pt-8 lg:gap-2.5',
  d: 'flex-col items-center gap-2 pb-4 pt-8 font-mono text-[0.6875rem] text-fg-dim',
}

export default function ScrollCue({ inHero }: { inHero: boolean }) {
  const t = ui[useLang()].hero
  const reduce = useReducedMotion()
  const variant = useCueVariant()

  return (
    // Pinned to the screen below lg, back in the orb's column from lg. The
    // hero is taller than a phone - 1053px against 780 on a 360 screen in
    // Thai - so in the flow the one thing whose job is to say "there is
    // more" sits below the fold on every phone size. pointer-events-none:
    // it is a sign, never a target. No ancestor below lg carries a transform
    // (the column's -translate-y-10 is lg-only), which `fixed` would
    // otherwise resolve against. The gradient is not decoration: pinned to
    // the bottom it lands on the orb, and dim ink on the grey portrait is
    // unreadable without something to sit on.
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: inHero ? 1 : 0 }}
      transition={{ delay: inHero ? 1.2 : 0, duration: reduce ? 0 : 0.3 }}
      className={`pointer-events-none fixed inset-x-0 bottom-0 z-40 flex bg-linear-to-t from-bg via-bg/90 to-transparent lg:static lg:z-auto lg:mt-2 lg:bg-none lg:pt-0 lg:pb-0 ${BOX[variant]}`}
    >
      {variant === 'a' && <PromptCue scroll={t.scroll} opt={t.scrollOpt} reduce={!!reduce} />}
      {variant === 'b' && <ArrowCue scroll={t.scroll} />}
      {variant === 'c' && <RailCue scroll={t.scroll} reduce={!!reduce} />}
      {variant === 'd' && <WheelCue scroll={t.scroll} reduce={!!reduce} />}
    </motion.div>
  )
}

/**
 * a - the prompt. A command line the visitor is one keystroke from running.
 * This site keeps a shell in three other places - the boot log, the header's
 * cd prompt, the About terminal that hands itself to a real Linux - and all
 * three print the same thing: a dim sigil, the words, a blinking block.
 * Saying "there is more" in that hand ties the hero to the rest of the page,
 * and says it as a state rather than an instruction: a caret parked at the
 * end of a typed line is a machine waiting for input, which is exactly what
 * the bottom of a full-height hero is. Hence no uppercase and no tracking,
 * which the old label had - a shell does not letterspace what you type.
 */
function PromptCue({ scroll, opt, reduce }: { scroll: string; opt: string; reduce: boolean }) {
  return (
    <>
      {/* the visible line is four glyph runs and two of them are punctuation;
          a screen reader gets the sentence instead, which is what the label
          was always for */}
      <span className="sr-only">{scroll}</span>
      {/* the sigil recedes and the option is the one bright token, the same
          three-step fade TerminalLog gives a typed line */}
      <span aria-hidden className="mr-2 text-fg-dim">
        $
      </span>
      <span aria-hidden className="text-fg-muted">
        scroll
      </span>
      {/* one mono cell of air before the option and none before the block:
          after a line you have finished typing the caret sits in the very
          next cell, and that adjacency is what reads as a live prompt rather
          than an arrow with a word next to it. ▋ is the site's one cursor -
          boot log, role ticker, terminal log all blink it. txt-glow on the
          block alone, so the caret picks up whatever --glow means to the
          theme in force and the words beside it stay flat. */}
      <span aria-hidden className="ml-[0.6em] text-fg">
        {opt}
      </span>
      <span aria-hidden className={reduce ? 'txt-glow text-fg' : 'animate-blink txt-glow text-fg'}>
        ▋
      </span>
    </>
  )
}

/**
 * b - the ink arrow. Drawn, not typed: a glyph like the old ▼ is whatever
 * face the fallback stack lands on, and it sat a hand's width under a
 * hand-inked bubble looking like it came from a different page. <InkArrow/>
 * answers the bubble in its own pen. Full ink against the dim label, so the
 * direction carries first and the words are the footnote.
 */
function ArrowCue({ scroll }: { scroll: string }) {
  return (
    <>
      {/* the Thai line is half again as long as the English one and stacks
          its vowels and tone marks, so it gives back some of the tracking and
          takes the leading it needs; both fit one line at 360 */}
      <span className="uppercase leading-none tracking-[0.2em] th:leading-[1.6] th:tracking-[0.08em]">
        {scroll}
      </span>
      {/* the cue fades in at 1.2s; the pen starts just after it */}
      <InkArrow delay={1.35} className="text-fg" />
    </>
  )
}

/**
 * c - the rail. No glyph at all. This screen already carries a duck, an orb,
 * three CRT lines and a speech bubble; a triangle would be one more shape
 * asking to be looked at, and the one thing here that is pure instruction
 * should be the quietest thing on the screen. A hairline that thickens
 * toward its foot and stops on a tick says "down" the way a crop mark does.
 *
 * The heights differ on purpose: pinned to the bottom of a 780px phone this
 * sits on top of the orb, so every pixel it grows is a pixel of Sky's face
 * it covers - 40px there, 56px back in the column where it costs nothing.
 */
function RailCue({ scroll, reduce }: { scroll: string; reduce: boolean }) {
  return (
    <>
      {/* The negative margin-end is not spacing: letter-spacing is added after
          the last glyph too, so a centred line with this much of it sits half
          a track left of true. Against a 1px rail directly underneath, that
          miss is the whole difference between a mark and a mistake. Thai gets
          its own, smaller track - spacing this script pulls the vowel away
          from the consonant it belongs to - and a step more size and leading,
          because the tone marks stack above the vowel. */}
      <span className="-me-[0.34em] font-mono text-[0.625rem] uppercase leading-[1.2] tracking-[0.34em] text-fg-dim th:-me-[0.14em] th:text-[0.6875rem] th:leading-[1.7] th:tracking-[0.14em]">
        {scroll}
      </span>

      <span aria-hidden className="relative block h-10 w-px lg:h-14">
        {/* The rail. Its own gradient runs near-nothing at the top to
            near-solid at the foot, so the line has a direction built into it
            standing still - which is what has to hold when the travelling
            mark below is not rendered at all. The mask earns its place twice
            over: it feathers the rail's two ends, and because a mask applies
            to everything the element paints, it feathers the mark into and
            out of those same ends for free. */}
        <span className="absolute inset-0 bg-[linear-gradient(to_bottom,rgb(var(--fg)/0.08),rgb(var(--fg)/0.5))] [mask-image:linear-gradient(to_bottom,transparent,#000_30%,#000_88%,transparent)]">
          {/* Painted as a background rather than a translated child so the
              travel is measured against the rail's own height and one
              keyframe serves both sizes (see rail-drop in globals.css).
              opacity-0 is the resting state and the animation overrides it,
              so a browser that kills the animation leaves nothing behind
              instead of a stub parked at the top. Not rendered at all under
              reduced motion: it is the accent, never the message. */}
          {!reduce && (
            <span className="absolute inset-0 animate-rail-drop bg-[linear-gradient(to_bottom,transparent,rgb(var(--fg)/0.95))] bg-no-repeat opacity-0 [background-size:100%_1.25rem]" />
          )}
        </span>
        {/* The foot. A 1px line dissolving into nothing is a smudge; the same
            line stopping on a short crossbar is a register mark, and a
            register mark has an end you can point at. Outside the masked
            element on purpose, so it stays crisp exactly where the rail gives
            out. */}
        <span className="absolute bottom-0 left-1/2 h-px w-1 -translate-x-1/2 bg-[rgb(var(--fg)/0.45)]" />
      </span>
    </>
  )
}

/**
 * d - the wheel. The one scroll cue nobody has to be taught, but drawn here
 * rather than borrowed, so it arrives as part of this page instead of as
 * somebody else's icon set. The outline is the ink the page rules itself
 * with, rgb(var(--fg)/0.5), at the same 1px the panels are bordered in, and
 * vector-effect holds it at that weight through the root font-size ramp
 * (100% to 140%) exactly the way InkBubble's pen is held.
 */
function WheelCue({ scroll, reduce }: { scroll: string; reduce: boolean }) {
  return (
    <>
      {/* The body is not a stadium. The crown is an 8-unit arc and the base
          an 11-unit one, so it sits fuller at the bottom the way a mouse does
          under a palm: three units of asymmetry, which is about all it takes
          to separate something drawn from the default everyone ships, and it
          leans the whole silhouette downward, which is the message anyway.

          The paper fill is InkBubble's trick at lower strength. Below lg this
          lands on the portrait, and a 1px outline with the grey coming
          through it is the one case the gradient alone does not cover; at lg
          it is bg over bg and vanishes. */}
      <svg aria-hidden viewBox="0 0 20 32" className="h-8 w-5">
        <path
          d="M0.5 8.5A9.5 8 0 0 1 19.5 8.5L19.5 20.5A9.5 11 0 0 1 0.5 20.5Z"
          fill="rgb(var(--bg) / 0.6)"
          stroke="rgb(var(--fg) / 0.5)"
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />
        {/* the wheel is a short ink stroke, not a round dot: a vertical mark
            already points where it is going, and a pen mark belongs to this
            page in a way a bullet does not. Under reduced motion it stays
            parked at the top, which is where a mouse is drawn at rest - the
            pictogram still reads without a single frame of movement. */}
        <motion.rect
          x={9}
          y={7}
          width={2}
          height={4.5}
          rx={1}
          fill="rgb(var(--fg) / 0.8)"
          animate={reduce ? undefined : fall}
          transition={reduce ? undefined : fallTiming}
        />
      </svg>
      {/* the pl answers the tracking: 0.2em hangs off the last letter with
          nothing to balance it, and a box centred on that walks the word a
          pixel left of the 20px mouse standing over it. Thai gets almost none
          of the tracking, because the script stacks its marks and pulling the
          bases apart at 11px only sets them adrift. */}
      <span className="pl-[0.2em] uppercase leading-[1.15] tracking-[0.2em] th:pl-0 th:leading-[1.6] th:tracking-[0.04em]">
        {scroll}
      </span>
    </>
  )
}
