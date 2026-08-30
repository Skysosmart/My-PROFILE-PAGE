'use client'

import { ReactNode } from 'react'
import { motion, useReducedMotion, type Variants } from 'framer-motion'

/**
 * A frosted-glass content panel with a monospace eyebrow label + title.
 * Each section passes a different `variant` so every section reveals with its
 * own scroll-in animation. Reduced-motion falls back to a plain fade.
 */
export type RevealVariant = 'flip' | 'blur' | 'slide' | 'zoom' | 'rise'

/**
 * Reveal variants.
 *
 * Careful with sections taller than the viewport: whileInView observes the
 * element's TRANSFORMED box, so a hidden state that displaces by a share of
 * the element (flip's rotateX, zoom/blur's scale) can throw a very tall
 * section clean off screen - the observer then never fires and it stays
 * hidden forever. 'rise' and 'slide' offset by a fixed amount and are safe at
 * any height.
 */
const VARIANTS: Record<RevealVariant, Variants> = {
  // fold down from the top (transform-based; reliable, unlike clipPath)
  flip: {
    hidden: { opacity: 0, rotateX: -20, y: 40, transformPerspective: 900 },
    show: { opacity: 1, rotateX: 0, y: 0, transformPerspective: 900 },
  },
  // blur into focus + settle
  blur: {
    hidden: { opacity: 0, filter: 'blur(16px)', scale: 0.96 },
    show: { opacity: 1, filter: 'blur(0px)', scale: 1 },
  },
  // slide in from the left
  slide: {
    hidden: { opacity: 0, x: -70 },
    show: { opacity: 1, x: 0 },
  },
  // zoom in
  zoom: {
    hidden: { opacity: 0, scale: 0.9 },
    show: { opacity: 1, scale: 1 },
  },
  // rise up
  rise: {
    hidden: { opacity: 0, y: 44 },
    show: { opacity: 1, y: 0 },
  },
}

export default function GlassSection({
  id,
  index,
  title,
  variant = 'rise',
  background,
  fullScreen = false,
  revealAmount = 0.2,
  tone = 'dark',
  panel = true,
  children,
}: {
  id: string
  index: string
  title: string
  variant?: RevealVariant
  /** Optional section-scoped background layer (e.g. an ASCII art watermark). */
  background?: ReactNode
  /** Fill the whole viewport so ONLY this section is on screen when landed on. */
  fullScreen?: boolean
  /**
   * How much of the section must be on screen before it reveals. The 0.2
   * default assumes a roughly screen-sized section; a section taller than the
   * viewport can never show 20% of itself, and would stay hidden forever.
   * Pass 'some' for sections that grow with their content.
   */
  revealAmount?: number | 'some' | 'all'
  /** 'light' brightens the screen: a white wash + a lighter panel. */
  tone?: 'dark' | 'light'
  /** false = no floating glass card; content lays flat on the screen itself. */
  panel?: boolean
  children: ReactNode
}) {
  const reduce = useReducedMotion()
  const variants: Variants = reduce
    ? { hidden: { opacity: 0 }, show: { opacity: 1 } }
    : VARIANTS[variant]

  return (
    <section
      id={id}
      // overflow-x-clip: 3D reveal variants (flip) project a wider bounding box
      // in their hidden state, which would add horizontal page overflow.
      className={`relative isolate overflow-x-clip px-4 sm:px-6 ${
        fullScreen
          ? 'flex min-h-screen scroll-mt-0 flex-col justify-center py-24'
          : 'scroll-mt-28 py-10 sm:py-14'
      }`}
    >
      {/* light tone: soft white wash brightening the whole screen */}
      {tone === 'light' && (
        <div
          aria-hidden
          className="absolute inset-0 -z-20 bg-[radial-gradient(ellipse_85%_75%_at_50%_40%,rgba(255,255,255,0.17),rgba(255,255,255,0.06)_60%,transparent_88%)]"
        />
      )}
      {background}
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: revealAmount }}
        variants={variants}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className={
          panel
            ? `glass-panel mx-auto w-full max-w-5xl rounded-2xl p-6 sm:p-9 ${
                tone === 'light' ? 'glass-panel--light' : ''
              }`
            : 'flex w-full flex-1 flex-col' // flat: content IS the screen
        }
      >
        {/* header: index + title reveal with a growing underline */}
        <div className="relative mb-7 flex items-baseline gap-3 pb-4">
          <motion.span
            initial={reduce ? { opacity: 0 } : { opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: revealAmount }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="font-mono text-xs text-white/40"
          >
            {index}
          </motion.span>
          <motion.h2
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: revealAmount }}
            transition={{ duration: 0.5, delay: 0.22 }}
            className="font-mono text-lg font-bold uppercase tracking-[0.2em] text-white txt-glow sm:text-xl"
          >
            {title}
          </motion.h2>
          {/* underline grows in */}
          <motion.span
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, amount: revealAmount }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-x-0 bottom-0 h-px origin-left bg-white/10"
          />
        </div>

        {children}
      </motion.div>
    </section>
  )
}
