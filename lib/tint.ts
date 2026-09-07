/**
 * The paper changes tone from section to section.
 *
 * Every section registers itself here. One IntersectionObserver watches a
 * band across the middle of the viewport; whichever section spans that band
 * owns the tone, as `<html data-tint="about">`. Nowhere (the hero, the
 * footer) is the plain paper. The tones live in globals.css and the fade is
 * the `.page-tint` layer's own, so a change costs one solid repaint of one
 * compositor layer: nothing on the main thread and nothing per scroll frame.
 */
import { useEffect, useRef } from 'react'

let io: IntersectionObserver | null = null
const live = new Set<Element>()
const ids = new WeakMap<Element, string>()
let current = ''

// the most recently entered section wins a tie; ties last a frame at most
function pick() {
  let next = ''
  for (const el of live) next = ids.get(el) ?? ''
  if (next === current) return
  current = next
  const root = document.documentElement
  if (next) root.dataset.tint = next
  else delete root.dataset.tint
}

export function watchTint(el: Element | null, id: string): () => void {
  if (!el || typeof IntersectionObserver === 'undefined') return () => {}
  io ??= new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) live.add(e.target)
        else live.delete(e.target)
      }
      pick()
    },
    { rootMargin: '-50% 0px -50% 0px', threshold: 0 },
  )
  ids.set(el, id)
  io.observe(el)
  return () => {
    io?.unobserve(el)
    live.delete(el)
    pick()
  }
}

/** the ref for a section's root element; the section owns the tone `id` */
export function useTint<T extends HTMLElement = HTMLElement>(id: string) {
  const ref = useRef<T>(null)
  useEffect(() => watchTint(ref.current, id), [id])
  return ref
}
