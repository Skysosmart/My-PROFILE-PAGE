'use client'

import { applyLang } from '@/lib/lang'
import { useLang } from '@/lib/use-lang'

/**
 * EN / TH at the right end of the command pill, next to the theme glyph.
 * A click flips the language and remembers it; `lang th|en` in the prompt
 * does the same thing by keyboard.
 */
export default function LangToggle() {
  const lang = useLang()
  const next = lang === 'th' ? 'en' : 'th'
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation() // the pill around it focuses the prompt on click
        applyLang(next)
      }}
      aria-label={next === 'th' ? 'เปลี่ยนเป็นภาษาไทย' : 'Switch to English'}
      title={`lang ${next}`}
      className="shrink-0 rounded-sm px-1 font-mono text-[0.6875rem] font-bold uppercase leading-none tracking-[0.1em] text-fg/70 transition-colors hover:text-fg focus-visible:outline focus-visible:outline-1 focus-visible:outline-fg/60"
    >
      {/* shows the language you would switch TO, like the theme glyph */}
      {next}
    </button>
  )
}
