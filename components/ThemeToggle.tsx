'use client'

import { useEffect, useState } from 'react'
import { applyPref, currentTheme, getPref, onThemeChange, type Theme } from '@/lib/theme'

/**
 * Sun / moon at the right end of the command pill. A click flips between the
 * two themes and remembers it; `theme system` in the prompt hands control back
 * to the OS. While the preference is 'system' this also listens for the OS
 * flipping and follows it.
 */
export default function ThemeToggle() {
  // null until mounted: the server does not know the theme, and rendering a
  // guess would flash the wrong glyph for a frame
  const [theme, setTheme] = useState<Theme | null>(null)

  useEffect(() => {
    setTheme(currentTheme())
    const off = onThemeChange(setTheme)
    const mq = window.matchMedia('(prefers-color-scheme: light)')
    const follow = () => getPref() === 'system' && applyPref('system')
    mq.addEventListener('change', follow)
    return () => {
      off()
      mq.removeEventListener('change', follow)
    }
  }, [])

  const next: Theme = theme === 'light' ? 'dark' : 'light'
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation() // the pill around it focuses the prompt on click
        applyPref(next)
      }}
      aria-label={`Switch to ${next} theme`}
      title={`theme ${next}`}
      className="shrink-0 rounded px-1 font-mono text-[13px] leading-none text-fg/55 transition-colors hover:text-fg focus-visible:outline focus-visible:outline-1 focus-visible:outline-fg/60"
    >
      {/* both glyphs are in the mono font already; no icon set to ship */}
      <span aria-hidden>{theme === null ? '\u25D0' : theme === 'light' ? '\u263E' : '\u2600'}</span>
    </button>
  )
}
