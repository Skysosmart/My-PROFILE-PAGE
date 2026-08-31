'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { player, nav } from '@/data/portfolio'
import ThemeToggle from '@/components/ThemeToggle'
import { applyPref, currentTheme } from '@/lib/theme'

/**
 * The navigation IS a command line.
 *
 * A prompt sits at the top of the page. Click it, or hit Ctrl/Cmd+K, and it
 * takes focus: type to filter the sections, arrow keys to move, Enter to go.
 * The sections read as paths because that is what they behave like, and the
 * site already answers to a terminal in About - this makes the whole page
 * consistent with that rather than bolting a glass pill on top of it.
 *
 * Ctrl+K rather than "/" on purpose: About has its own terminal input, and a
 * bare slash would be stolen from anyone typing in it.
 */
export default function Header() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [cursor, setCursor] = useState(0)
  const [time, setTime] = useState('')

  const inputRef = useRef<HTMLInputElement>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('en-GB'))
    tick()
    const id = window.setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return nav
    return nav.filter((n) => n.label.toLowerCase().includes(q) || n.id.includes(q))
  }, [query])

  useEffect(() => setCursor(0), [query])

  const go = useCallback(
    (id: string) => {
      setOpen(false)
      setQuery('')
      inputRef.current?.blur()
      // the archive lives on its own route, so from there we have to travel
      // back to the one-pager before the anchor means anything
      if (pathname !== '/') {
        router.push(`/#${id}`)
        return
      }
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    },
    [pathname, router],
  )

  // Ctrl/Cmd+K focuses the prompt from anywhere
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen(true)
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // click outside closes
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener('mousedown', onDown)
    return () => window.removeEventListener('mousedown', onDown)
  }, [open])

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setOpen(true)
      setCursor((c) => (c + 1) % Math.max(matches.length, 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setOpen(true)
      setCursor((c) => (c - 1 + matches.length) % Math.max(matches.length, 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      // the prompt is a command line, so `theme light|dark|system` is a real
      // command; bare `theme` flips whatever is on
      const [cmd, arg] = query.trim().toLowerCase().split(/\s+/)
      if (cmd === 'theme') {
        applyPref(arg === 'light' || arg === 'dark' || arg === 'system' ? arg : currentTheme() === 'dark' ? 'light' : 'dark')
        setOpen(false)
        setQuery('')
        inputRef.current?.blur()
        return
      }
      const pick = matches[cursor]
      if (pick) go(pick.id)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setOpen(false)
      setQuery('')
      inputRef.current?.blur()
    }
  }

  return (
    <motion.header
      initial={{ opacity: 0, y: -18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
      className="pointer-events-none fixed inset-x-0 top-0 z-[70] flex justify-center px-3 pt-3 sm:px-4 sm:pt-4"
    >
      <div ref={boxRef} className="pointer-events-auto w-full max-w-2xl">
        {/* the prompt */}
        <div
          onClick={() => {
            setOpen(true)
            inputRef.current?.focus()
          }}
          className={`flex cursor-text items-center gap-2 border bg-bg/85 px-3 py-2 font-mono text-[12px] backdrop-blur-xl transition-colors sm:px-4 ${
            open ? 'border-fg/40' : 'border-fg/15 hover:border-fg/25'
          } ${open ? 'rounded-t-lg' : 'rounded-lg'}`}
        >
          <span className="shrink-0 select-none text-fg-dim">
            <span className="text-fg/70">{player.handle.toLowerCase().replace('.exe', '')}</span>
            <span className="text-fg/25">@exe</span>
            <span className="text-fg-dim">:~$</span>
          </span>
          <span className="shrink-0 select-none text-fg-muted">cd</span>

          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            role="combobox"
            aria-expanded={open}
            aria-controls="nav-listbox"
            aria-autocomplete="list"
            aria-label="Jump to a section"
            placeholder={open ? '' : 'type or ⌘K'}
            className="min-w-0 flex-1 bg-transparent text-fg caret-fg outline-none placeholder:text-fg/25"
          />

          <span className="hidden shrink-0 select-none tabular-nums tracking-widest text-fg-dim sm:inline">
            {time || '--:--:--'}
          </span>
          <ThemeToggle />
        </div>

        {/* the sections, as paths */}
        {/* Not AnimatePresence: its exit animations do not settle reliably in this
            project - the same thing stranded the boot screen - and a list left
            mounted at height 0 swallows clicks. A plain conditional unmounts. */}
        {open && (
          <ul
            id="nav-listbox"
            role="listbox"
            className="overflow-hidden rounded-b-lg border border-t-0 border-fg/40 bg-bg/90 font-mono text-[12px] backdrop-blur-xl"
          >
            {matches.length === 0 && (
              <li className="px-3 py-2 text-fg-dim sm:px-4">
                {query.trim().toLowerCase().startsWith('theme')
                  ? 'theme light | dark | system'
                  : `no such section: ${query}`}
              </li>
            )}
            {matches.map((n, i) => {
                const on = i === cursor
                return (
                  <li key={n.id} role="option" aria-selected={on}>
                    <button
                      onMouseEnter={() => setCursor(i)}
                      onClick={() => go(n.id)}
                      className={`flex w-full items-center gap-2 px-3 py-1.5 text-left transition-colors sm:px-4 ${
                        on ? 'bg-fg/10 text-fg' : 'text-fg-muted hover:text-fg'
                      }`}
                    >
                      <span className={`w-3 shrink-0 ${on ? 'text-fg' : 'text-transparent'}`}>
                        &#9656;
                      </span>
                      <span className="flex-1 lowercase">{n.label}/</span>
                      <span className="shrink-0 tabular-nums text-fg-dim">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                    </button>
                  </li>
                )
              })}
            <li className="flex items-center gap-3 border-t border-fg/10 px-3 py-1.5 text-[10px] uppercase tracking-wider text-fg/25 sm:px-4">
                <span>&#8593;&#8595; move</span>
                <span>&#8629; open</span>
                <span>esc close</span>
              </li>
          </ul>
        )}
      </div>
    </motion.header>
  )
}
