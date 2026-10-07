'use client'

import StackSheet from '@/components/profile/StackSheet'
import { ui } from '@/data/ui'
import { useLang } from '@/lib/use-lang'
import { useTint } from '@/lib/tint'

/**
 * 03 · CURRENT STACK - the inventory as the stack sheet (components/profile/
 * StackSheet.tsx): file-folder tabs, a dashed reference sheet, every group a
 * row of marks with Sky's own 1-5 level under each. Picking a tab opens each
 * skill up in place, with what it is for and the projects it shipped on.
 *
 * It wears the stack sheet's own heading - an accent rule, the title in
 * mono, one plain line under it - rather than the bracketed section header,
 * so the section reads as the sheet and not as a box around it.
 */
export default function Skills() {
  const t = ui[useLang()].skills
  const ref = useTint('skills')

  return (
    <section ref={ref} id="skills" className="relative isolate scroll-mt-28 overflow-x-clip px-[clamp(16px,4vw,64px)] py-14 sm:py-20">
      <div
        aria-hidden
        className="pointer-events-none absolute right-2 top-0 -z-10 select-none font-crt text-[10rem] leading-none text-fg/[0.04] sm:right-6 sm:text-[18.75rem]"
      >
        STACK
      </div>
      <div className="mx-auto w-full max-w-[92.5rem]">
        <header className="mb-8 border-l-4 border-accent pl-4 sm:mb-10">
          <p className="mb-2 font-mono text-[0.75rem] uppercase tracking-[0.3em] text-fg-dim">
            <span className="mr-2 rounded-[3px] bg-accent px-1.5 py-0.5 text-[0.6875rem] font-bold leading-none tracking-normal text-[#111]">03</span>
            {t.label}
          </p>
          <h2 className="font-mono text-[1.75rem] font-bold uppercase leading-tight tracking-[0.14em] text-fg th:tracking-normal sm:text-[2.25rem]">{t.title}</h2>
          <p className="mt-1 font-sans text-base text-fg-muted th:leading-[1.7]">{t.sub}</p>
        </header>
        <StackSheet />
      </div>
    </section>
  )
}
