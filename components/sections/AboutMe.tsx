'use client'

import { useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import Image from 'next/image'
import GlassSection from '@/components/ui/GlassSection'
import Ascii3D from '@/components/effects/Ascii3D'
import { assets } from '@/data/portfolio'
import { ZARU_MARK } from '@/data/zaru-mark'
import { ui } from '@/data/ui'
import { useContent } from '@/lib/use-content'
import { useLang } from '@/lib/use-lang'

/**
 * ABOUT ME - a printed terminal on the left, the portrait window on the
 * right, the ASCII torus knot behind. Ink on the site's paper, the section's
 * accent (tangerine) for the marks.
 *
 * It used to be an interactive terminal (commands, a real Linux behind
 * `boot`). It reads like one still - each block is headed by the command
 * that would print it - but everything is on the page: the intro, the
 * facts, the story behind a "Read more", the principles. Nothing has to be
 * typed to be found.
 *
 * The ZaruTech lettering at the top is the one on the duck's chest, the same
 * one the opening film writes; it writes itself on here too.
 */

const EASE = [0.16, 1, 0.3, 1] as const

/** a line as the terminal would show the command: `$ cat story.md` */
function Prompt({ children }: { children: string }) {
  return (
    <p className="mb-3 font-mono text-[0.8125rem] text-fg-dim">
      <span className="mr-2 text-accent-text">$</span>
      <span className="text-fg">{children}</span>
    </p>
  )
}

/** the chest lettering, revealed left to right like the pen that wrote it */
function Lettering() {
  const reduce = useReducedMotion()
  // the wrapper watches the viewport, not the svg: a fully clipped element
  // never counts as in view, so it would wait for itself forever
  return (
    <motion.div
      initial={reduce ? 'shown' : 'hidden'}
      whileInView="shown"
      viewport={{ once: true, amount: 0.5 }}
      className="w-[min(17rem,70%)]"
    >
      <motion.svg
        viewBox={ZARU_MARK.viewBox}
        role="img"
        aria-label="ZaruTech"
        className="block h-auto w-full text-fg"
        variants={{
          // the same units on both ends, or the inset cannot be interpolated
          hidden: { clipPath: 'inset(0% 100% 0% 0%)' },
          shown: { clipPath: 'inset(0% 0% 0% 0%)', transition: { duration: 1.1, ease: EASE } },
        }}
      >
        <g transform={ZARU_MARK.transform} fill="currentColor">
          {ZARU_MARK.letters.map((d, i) => (
            <path key={i} d={d} />
          ))}
          <path d={ZARU_MARK.swoosh} />
        </g>
      </motion.svg>
    </motion.div>
  )
}

export default function AboutMe() {
  const lang = useLang()
  const t = ui[lang].about
  // the prose in the language that is on
  const { about, sop, inspiration, player } = useContent()
  const [more, setMore] = useState(false)
  const story = more ? sop.paragraphs : sop.paragraphs.slice(0, sop.shortCount)

  return (
    <GlassSection
      id="about"
      index="01"
      title="About me"
      command="cat story.md"
      variant="blur"
      background={<Ascii3D />}
      fullScreen
      tone="light"
      panel={false}
    >
      <div className="flex flex-1 flex-col gap-4 md:flex-row md:items-start">
        {/* the printed terminal (left) */}
        <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-fg/12 bg-white">
          <div className="flex items-center gap-2 border-b border-fg/10 bg-fg/3 px-4 py-2.5">
            <span className="h-2.5 w-2.5 rounded-full border border-fg/25" />
            <span className="h-2.5 w-2.5 rounded-full border border-fg/25" />
            <span className="h-2.5 w-2.5 rounded-full bg-fg/60" />
            <span className="ml-2 font-mono text-[0.8125rem] text-fg-dim">~/about</span>
          </div>

          <div className="flex flex-col gap-9 p-5 sm:p-8">
            <Lettering />

            <section>
              <Prompt>whoami</Prompt>
              <div className="space-y-3 font-sans text-[0.9375rem] leading-relaxed text-fg-muted sm:text-base">
                {about.paragraphs.map((p, i) => (
                  <p key={i} className={i === 0 ? 'text-fg' : undefined}>
                    {p}
                  </p>
                ))}
              </div>
              {/* the facts, as the spec label prints them */}
              <dl className="mt-5 grid grid-cols-1 border-t border-fg/12 font-mono text-[0.75rem] sm:grid-cols-2">
                {about.facts.map((f) => (
                  <div key={f.key} className="flex gap-3 border-b border-fg/12 py-2 sm:odd:pr-4">
                    <dt className="w-20 shrink-0 uppercase tracking-[0.2em] text-fg-dim">{f.key}</dt>
                    <dd className="text-fg">{f.value}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section>
              <Prompt>cat story.md</Prompt>
              <div className="space-y-3 font-sans text-[0.9375rem] leading-relaxed text-fg-muted sm:text-base">
                {story.map((p, i) => (
                  <motion.p
                    key={i}
                    initial={i >= sop.shortCount ? { opacity: 0, y: 8 } : false}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: EASE, delay: i >= sop.shortCount ? (i - sop.shortCount) * 0.05 : 0 }}
                  >
                    {p}
                  </motion.p>
                ))}
              </div>
              {sop.paragraphs.length > sop.shortCount && (
                <button
                  type="button"
                  onClick={() => setMore((m) => !m)}
                  aria-expanded={more}
                  className="mt-4 inline-flex items-center gap-2 rounded-sm border border-fg/25 px-3 py-1.5 font-mono text-[0.75rem] uppercase tracking-[0.2em] text-fg transition-colors hover:border-fg hover:bg-fg hover:text-bg"
                >
                  {more ? t.readLess : t.readMore}
                  <span aria-hidden className={`transition-transform ${more ? 'rotate-180' : ''}`}>
                    ↓
                  </span>
                </button>
              )}
            </section>

            <section>
              <Prompt>ls principles/</Prompt>
              <ul className="grid gap-3 sm:grid-cols-2">
                {inspiration.map((p, i) => (
                  <motion.li
                    key={p.title}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 0.5, ease: EASE, delay: i * 0.06 }}
                    className="rounded-lg border border-fg/12 bg-white p-4"
                  >
                    <p className="mb-1.5 flex items-center gap-2 font-sans text-[0.9375rem] font-semibold text-fg">
                      <span aria-hidden className="h-2.5 w-2.5 shrink-0 bg-accent" />
                      {p.title}
                    </p>
                    <p className="font-sans text-sm leading-relaxed text-fg-muted">{p.description}</p>
                  </motion.li>
                ))}
              </ul>
            </section>
          </div>
        </div>

        {/* portrait (right) - same window chrome; pinned beside the longer
            column on a wide screen */}
        <figure className="group flex flex-col overflow-hidden rounded-xl border border-fg/12 bg-white md:sticky md:top-24 md:w-[20rem] lg:w-[22.5rem]">
          <div className="flex items-center gap-2 border-b border-fg/10 bg-fg/3 px-4 py-2.5">
            <span className="h-2.5 w-2.5 rounded-full border border-fg/25" />
            <span className="h-2.5 w-2.5 rounded-full border border-fg/25" />
            <span className="h-2.5 w-2.5 rounded-full bg-fg/60" />
            <span className="ml-2 font-mono text-[0.8125rem] text-fg-dim">~/portrait - me.jpg</span>
          </div>
          <Image
            src={assets.portrait}
            alt={player.name}
            width={900}
            height={1398}
            sizes="(min-width: 1024px) 360px, (min-width: 768px) 320px, 100vw"
            className="h-80 w-full object-cover object-top transition-all duration-500 md:h-[34rem]"
          />
          <figcaption className="border-t border-fg/10 px-4 py-2 font-mono text-[0.75rem] uppercase tracking-widest text-fg-dim">
            {player.name} · {player.role}
          </figcaption>
        </figure>
      </div>
    </GlassSection>
  )
}
