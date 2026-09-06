'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { motion, useMotionValue, useSpring } from 'motion/react'
import { useLang } from '@/lib/use-lang'
import { glossary } from '@/data/glossary'

/**
 * A marker-highlighted term. On a pointer device a small card with the
 * term's line from data/glossary.ts follows the cursor while it hovers
 * (phattaradit.dev does this on its profile); on touch a tap toggles it in
 * place. The highlight is the duck's yellow at low opacity.
 */
export function Mark({ term, children }: { term: string; children?: ReactNode }) {
  const lang = useLang()
  const text = glossary[term]?.[lang] ?? glossary[term]?.en
  const [open, setOpen] = useState(false)
  const [fine, setFine] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const x = useSpring(mx, { stiffness: 400, damping: 40 })
  const y = useSpring(my, { stiffness: 400, damping: 40 })

  useEffect(() => {
    setFine(window.matchMedia('(hover: hover) and (pointer: fine)').matches)
  }, [])

  const move = (e: React.PointerEvent) => {
    mx.set(e.clientX + 16)
    my.set(e.clientY + 16)
  }

  return (
    <span
      ref={ref}
      className="relative"
      data-cursor-label="what is this"
      onPointerEnter={(e) => {
        if (!fine) return
        move(e)
        setOpen(true)
      }}
      onPointerMove={fine ? move : undefined}
      onPointerLeave={() => fine && setOpen(false)}
      onClick={() => !fine && setOpen((o) => !o)}
    >
      <mark className="rounded-[0.125rem] bg-transparent px-0.5 text-fg [background-image:linear-gradient(transparent_58%,rgb(245_190_91/0.45)_58%)] [box-shadow:inset_0_-1px_0_rgb(245_190_91/0.9)]">
        {children ?? term}
      </mark>
      {open && text && (
        <motion.span
          role="tooltip"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          style={fine ? { position: 'fixed', left: 0, top: 0, x, y } : undefined}
          className={`z-[75] block w-64 rounded-md border border-duck/60 bg-panel px-3 py-2 font-mono text-[0.6875rem] leading-relaxed text-fg shadow-[0_12px_30px_rgba(0,0,0,0.6)] ${
            fine ? 'pointer-events-none' : 'absolute left-0 top-full mt-2'
          }`}
        >
          <span className="mb-1 block text-[0.5625rem] uppercase tracking-[0.3em] text-duck">{term}</span>
          {text}
        </motion.span>
      )}
    </span>
  )
}
