'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import CertCard from '@/components/ui/CertCard'
import CertLightbox from '@/components/ui/CertLightbox'
import {
  CATS,
  LEVEL_TAG,
  bar,
  catMeta,
  certMatches,
  certStamp,
  certStampLabel,
  certStats,
  certThumb,
  certYear,
  groupByCategory,
  sortCerts,
  type SortKey,
} from '@/lib/certs'
import { player, type Certificate } from '@/data/portfolio'

/**
 * ~/certificates - the archive as a terminal file browser.
 *
 * The conceit is that the UI is a command, and the command is real: every
 * control writes itself into the line at the top, so the page always shows you
 * the query it just ran. Filtering by robotics, grepping "makex" and sorting by
 * level reads back as
 *
 *   $ ls ~/certificates/robotics --level=national | grep "makex" | sort -level
 *
 * Three facets stack - category, level, year - plus free text, and the rail's
 * counts re-tally against everything except the facet they belong to, so a
 * number in the rail is always the number you would get by clicking it.
 *
 * Two views: the card grid, and `ls` proper - a dense monospace table that puts
 * all 56 on a couple of screens. Arrow keys walk the results in either one.
 *
 * Deliberately still. After the pannable board, nothing here moves on its own:
 * every effect is on hover, focus or selection.
 */

const VIEW_KEY = 'cert-archive-view'

export default function CertArchive() {
  const [cat, setCat] = useState('all')
  const [level, setLevel] = useState<string | null>(null)
  const [year, setYear] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortKey>('date')
  const [dir, setDir] = useState<1 | -1>(1)
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [sel, setSel] = useState(-1)
  // the ring marks the keyboard cursor. Hovering still moves the cursor - so
  // Enter opens what you are pointing at - but drawing a ring under the mouse
  // as well would put a hard white box on whatever the pointer grazes.
  const [keyNav, setKeyNav] = useState(false)
  const [active, setActive] = useState<Certificate | null>(null)
  const [still, setStill] = useState(false)
  const [time, setTime] = useState('')
  const [headH, setHeadH] = useState(0)

  const grepRef = useRef<HTMLInputElement>(null)
  const headRef = useRef<HTMLDivElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setStill(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  // the same live clock the nav prompt carries
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('en-GB'))
    tick()
    const id = window.setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  // remember the view, but never let a private window or blocked storage throw
  useEffect(() => {
    try {
      const v = localStorage.getItem(VIEW_KEY)
      if (v === 'grid' || v === 'list') setView(v)
    } catch {}
  }, [])
  useEffect(() => {
    try {
      localStorage.setItem(VIEW_KEY, view)
    } catch {}
  }, [view])

  // the rail sticks directly under the control bar, whatever height it wraps to
  useEffect(() => {
    const el = headRef.current
    if (!el) return
    const measure = () => setHeadH(el.offsetHeight)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const byCat = useMemo(groupByCategory, [])

  /**
   * One filter step, with a facet optionally left out. Leaving a facet out is
   * how the rail counts stay honest: the level tally is taken from the list
   * filtered by everything BUT level, so each row shows what clicking it gives.
   */
  const apply = useCallback(
    (skip?: 'level' | 'year') => {
      let out = byCat.get(cat) ?? []
      if (level && skip !== 'level') out = out.filter((c) => c.level === level)
      if (year && skip !== 'year') out = out.filter((c) => certYear(c) === year)
      if (query) out = out.filter((c) => certMatches(c, query))
      return out
    },
    [byCat, cat, level, year, query],
  )

  const list = useMemo(() => sortCerts(apply(), sort, dir), [apply, sort, dir])

  const levelRows = useMemo(() => {
    const base = apply('level')
    const m = new Map<string, number>()
    base.forEach((c) => c.level && m.set(c.level, (m.get(c.level) ?? 0) + 1))
    const order = ['International', 'National', 'Provincial', 'Institution', 'School', 'Online']
    return order.filter((k) => m.has(k)).map((k) => [k, m.get(k) as number] as const)
  }, [apply])

  const yearRows = useMemo(() => {
    const base = apply('year')
    const m = new Map<string, number>()
    base.forEach((c) => {
      const y = certYear(c)
      if (y) m.set(y, (m.get(y) ?? 0) + 1)
    })
    return [...m.entries()].sort((a, b) => b[0].localeCompare(a[0]))
  }, [apply])

  const levelMax = Math.max(1, ...levelRows.map((r) => r[1]))
  const yearMax = Math.max(1, ...yearRows.map((r) => r[1]))

  const dirty = cat !== 'all' || !!level || !!year || !!query
  // the years the archive actually covers, read off the data not hard-coded
  const span = useMemo(() => {
    const stamps = (byCat.get('all') ?? []).map(certStamp).filter(Boolean)
    if (!stamps.length) return ''
    return `${Math.floor(Math.min(...stamps) / 100)}-${Math.floor(Math.max(...stamps) / 100)}`
  }, [byCat])

  // the command the current controls add up to
  const cmd = [
    `ls ~/certificates${cat === 'all' ? '' : '/' + cat}`,
    level ? ` --level=${level.toLowerCase()}` : '',
    year ? ` --year=${year}` : '',
    query ? ` | grep "${query}"` : '',
    ` | sort -${sort}${dir < 0 ? ' -r' : ''}`,
  ].join('')

  // keep the cursor inside the results when they shrink under it
  useEffect(() => {
    setSel((s) => (s >= list.length ? list.length - 1 : s))
  }, [list.length])

  const clearAll = () => {
    setCat('all')
    setLevel(null)
    setYear(null)
    setQuery('')
    setSel(-1)
  }

  // "/" opens the grep, arrows walk the results, enter opens, esc backs out
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null
      const typing = el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')

      if (e.key === '/' && !typing) {
        e.preventDefault()
        grepRef.current?.focus()
        return
      }
      if (e.key === 'Escape') {
        if (active) return // the lightbox closes itself
        if (query) setQuery('')
        else setSel(-1)
        grepRef.current?.blur()
        return
      }

      // with a certificate open, left/right walk the filtered list without
      // closing it - the archive reads like a stack of documents, not a set of
      // dead ends you have to back out of one at a time
      if (active) {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
        e.preventDefault()
        // opened by click from a cold selection: find where we actually are
        const from = sel >= 0 ? sel : list.findIndex((c) => c.file === active.file)
        if (from < 0 || list.length < 2) return
        const n = (from + (e.key === 'ArrowRight' ? 1 : -1) + list.length) % list.length
        setSel(n)
        setActive(list[n])
        return
      }

      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        if (!list.length) return
        e.preventDefault()
        const step = e.key === 'ArrowDown' ? 1 : -1
        setKeyNav(true)
        setSel((s) => {
          const n = s < 0 ? (step > 0 ? 0 : list.length - 1) : (s + step + list.length) % list.length
          resultsRef.current
            ?.querySelector(`[data-row="${n}"]`)
            ?.scrollIntoView({ block: 'nearest' })
          return n
        })
      } else if (e.key === 'Enter' && !typing && sel >= 0 && list[sel]) {
        e.preventDefault()
        setActive(list[sel])
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [list, sel, active, query])

  const handle = player.handle.toLowerCase().replace('.exe', '')

  const facet = (label: string, clear: () => void) => (
    <button
      key={label}
      onClick={clear}
      className="group inline-flex shrink-0 items-center gap-1.5 rounded border border-white/25 bg-white/[0.06] px-2 py-0.5 font-mono text-[11px] text-white/75 transition-colors hover:border-white/60 hover:text-white"
    >
      {label}
      <span className="text-white/35 transition-colors group-hover:text-white">&#10005;</span>
    </button>
  )

  return (
    <main className="min-h-screen pb-20">
      {/* ---------- title block: scrolls away, the controls below do not -------- */}
      <div className="mx-auto max-w-7xl px-4 pt-5 sm:px-6">
        <div className="flex items-center gap-2 font-mono text-[12px]">
          <span className="shrink-0 select-none">
            <span className="text-white/70">{handle}</span>
            <span className="text-white/25">@exe</span>
            <span className="text-white/40">:~$</span>
          </span>
          <span className="select-none text-white/55">cd</span>
          <span className="caret text-white">certificates/</span>
          <span className="ml-auto hidden shrink-0 select-none tabular-nums tracking-widest text-white/30 sm:inline">
            {time || '--:--:--'}
          </span>
        </div>

        <h1 className="mt-3 font-crt text-6xl leading-[0.85] tracking-[0.06em] text-white txt-glow sm:text-7xl lg:text-8xl">
          CERTIFICATES
        </h1>
        <p className="mt-2 font-mono text-[11px] text-white/40 sm:text-xs">
          {certStats.total} records · {certStats.gold} gold · {certStats.national} national ·{' '}
          {certStats.intl} international · {span}
        </p>
      </div>

      {/* ---------- the control bar, and the command it adds up to -------------- */}
      <div
        ref={headRef}
        className="sticky top-0 z-30 mt-5 border-y border-white/10 bg-black/85 backdrop-blur-xl"
      >
        <div className="mx-auto max-w-7xl px-4 py-2.5 sm:px-6">
          {/* the query, written out */}
          <div className="flex items-baseline gap-2 overflow-hidden font-mono text-[11px]">
            <span className="shrink-0 text-white/35">$</span>
            <code className="truncate text-white/60">{cmd}</code>
            <span className="ml-auto shrink-0 tabular-nums text-white/70">
              {list.length}
              <span className="text-white/30">
                /{certStats.total} record{list.length === 1 ? '' : 's'}
              </span>
            </span>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2">
            {/* grep */}
            <label className="flex min-w-0 flex-1 basis-52 items-center gap-2 rounded border border-white/15 bg-white/[0.04] px-2.5 py-1.5 font-mono text-[12px] transition-colors focus-within:border-white/45 sm:max-w-[20rem] sm:basis-64">
              <span className="shrink-0 select-none text-white/35">grep</span>
              <input
                ref={grepRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="press / to search"
                aria-label="Search the archive"
                className="min-w-0 flex-1 bg-transparent text-white caret-white outline-none placeholder:text-white/25"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  aria-label="Clear search"
                  className="shrink-0 text-white/35 transition-colors hover:text-white"
                >
                  &#10005;
                </button>
              )}
            </label>

            {/* what is currently narrowing the list */}
            {dirty && (
              <div className="flex flex-wrap items-center gap-1.5">
                {cat !== 'all' && facet(catMeta(cat).label.toLowerCase(), () => setCat('all'))}
                {level && facet(level.toLowerCase(), () => setLevel(null))}
                {year && facet(year, () => setYear(null))}
                <button
                  onClick={clearAll}
                  className="shrink-0 font-mono text-[11px] text-white/30 underline-offset-2 transition-colors hover:text-white hover:underline"
                >
                  reset
                </button>
              </div>
            )}

            <div className="ml-auto flex items-center gap-3">
              {/* sort: click the active key again to flip the direction */}
              <div className="flex items-center gap-1 font-mono text-[11px]">
                <span className="select-none text-white/30">sort</span>
                {(['date', 'level', 'name'] as SortKey[]).map((k) => {
                  const on = k === sort
                  return (
                    <button
                      key={k}
                      onClick={() => (on ? setDir((d) => (d === 1 ? -1 : 1)) : (setSort(k), setDir(1)))}
                      aria-pressed={on}
                      className={`rounded px-1.5 py-0.5 transition-colors ${
                        on ? 'bg-white text-neutral-900' : 'text-white/45 hover:text-white'
                      }`}
                    >
                      {k}
                      {on && <span className="ml-0.5">{dir === 1 ? '▾' : '▴'}</span>}
                    </button>
                  )
                })}
              </div>

              {/* view */}
              <div className="flex items-center gap-1 font-mono text-[11px]">
                {(['grid', 'list'] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    aria-pressed={v === view}
                    title={`${v} view`}
                    className={`rounded px-1.5 py-0.5 transition-colors ${
                      v === view ? 'bg-white text-neutral-900' : 'text-white/45 hover:text-white'
                    }`}
                  >
                    {v === 'grid' ? '▦' : '▤'} {v}
                  </button>
                ))}
              </div>

              <Link
                href="/#certificates"
                className="shrink-0 font-mono text-[11px] text-white/40 transition-colors hover:text-white"
              >
                &#8592; cd ..
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- rail + results --------------------------------------------- */}
      <div className="mx-auto flex max-w-7xl gap-6 px-4 pt-6 sm:px-6">
        <aside
          style={{ top: headH + 24 }}
          className="hidden w-52 shrink-0 self-start lg:sticky lg:block"
        >
          <nav aria-label="Category" className="font-mono text-[12px]">
            <p className="mb-1.5 text-white/30">~/certificates</p>
            {CATS.map((c, i) => {
              const on = c.key === cat
              const n = (byCat.get(c.key) ?? []).length
              return (
                <button
                  key={c.key}
                  onClick={() => setCat(c.key)}
                  aria-pressed={on}
                  className={`flex w-full items-center gap-1.5 rounded py-0.5 pr-1.5 text-left transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-white/60 ${
                    on ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white'
                  }`}
                >
                  <span className="select-none text-white/20">
                    {i === CATS.length - 1 ? '└─' : '├─'}
                  </span>
                  <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${c.dot}`} />
                  <span className="flex-1 truncate lowercase">{c.label}/</span>
                  <span className="shrink-0 tabular-nums text-white/30">{n}</span>
                </button>
              )
            })}
          </nav>

          <Facets
            title="by level"
            rows={levelRows.map(([k, n]) => [k, LEVEL_TAG[k] ?? k, n] as const)}
            max={levelMax}
            current={level}
            onPick={(k) => setLevel((v) => (v === k ? null : k))}
          />
          <Facets
            title="by year"
            rows={yearRows.map(([k, n]) => [k, k, n] as const)}
            max={yearMax}
            current={year}
            onPick={(k) => setYear((v) => (v === k ? null : k))}
          />

          <p className="mt-6 font-mono text-[10px] leading-relaxed text-white/20">
            / search · &#8593;&#8595; move · &#8629; open
            <br />
            &#8592;&#8594; flip through · esc clear
          </p>
        </aside>

        <div ref={resultsRef} className="min-w-0 flex-1">
          {/* the rail is desktop-only, so small screens keep the pill row */}
          <div className="mb-4 flex flex-wrap gap-1.5 lg:hidden">
            {CATS.map((c) => {
              const on = c.key === cat
              return (
                <button
                  key={c.key}
                  onClick={() => setCat(c.key)}
                  aria-pressed={on}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1 font-sans text-[12px] font-medium transition-colors ${
                    on
                      ? 'bg-white text-neutral-900'
                      : 'border border-white/15 text-white/65 hover:text-white'
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
                  {c.label}
                  <span className={on ? 'text-neutral-400' : 'text-white/30'}>
                    {(byCat.get(c.key) ?? []).length}
                  </span>
                </button>
              )
            })}
          </div>

          {list.length === 0 ? (
            <div className="glass-panel rounded-2xl px-6 py-20 text-center font-mono text-sm">
              <p className="text-white/60">no records match</p>
              <p className="mt-1 text-white/25">{cmd}</p>
              <button
                onClick={clearAll}
                className="mt-4 rounded border border-white/25 px-3 py-1 text-[12px] text-white/70 transition-colors hover:border-white/60 hover:text-white"
              >
                reset filters
              </button>
            </div>
          ) : view === 'grid' ? (
            <div className="glass-panel rounded-2xl p-4 sm:p-5">
              <div className="grid grid-cols-2 items-stretch gap-4 xl:grid-cols-3">
                {list.map((c, i) => (
                  <div
                    key={`${cat}:${c.file}`}
                    data-row={i}
                    onMouseEnter={() => {
                      setKeyNav(false)
                      setSel(i)
                    }}
                    className={`rounded-2xl ${
                      keyNav && i === sel ? 'ring-2 ring-white ring-offset-2 ring-offset-black' : ''
                    }`}
                  >
                    <CertCard cert={c} index={i} still={still} onOpen={setActive} />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <ListView
              list={list}
              sel={sel}
              onHover={(i) => {
                setKeyNav(false)
                setSel(i)
              }}
              onOpen={setActive}
              cat={cat}
            />
          )}

          <div className="mx-auto mt-8 max-w-md">
            <div className="ascii-rule opacity-40" />
            <p className="mt-3 text-center font-mono text-[11px] text-white/30">
              {list.length} of {certStats.total} records listed
            </p>
          </div>
        </div>
      </div>

      <CertLightbox cert={active} onClose={() => setActive(null)} />
    </main>
  )
}

/* -------------------------------------------------------------------------- */

/** A clickable histogram: [value, label, count] rows drawn as block bars. */
function Facets({
  title,
  rows,
  max,
  current,
  onPick,
}: {
  title: string
  rows: readonly (readonly [string, string, number])[]
  max: number
  current: string | null
  onPick: (k: string) => void
}) {
  if (!rows.length) return null
  return (
    <div className="mt-6 font-mono text-[11px]">
      <p className="mb-1.5 flex items-center gap-2 text-white/30">
        <span className="uppercase tracking-wider">{title}</span>
        <span className="h-px flex-1 bg-white/10" />
      </p>
      {rows.map(([key, label, n]) => {
        const on = key === current
        return (
          <button
            key={key}
            onClick={() => onPick(key)}
            aria-pressed={on}
            className={`flex w-full items-center gap-2 rounded px-1 py-0.5 text-left transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-white/60 ${
              on ? 'bg-white/10 text-white' : 'text-white/45 hover:text-white'
            }`}
          >
            <span className="w-10 shrink-0 truncate lowercase">{label}</span>
            <span className="shrink-0 tracking-tighter">
              <span className={on ? 'text-white' : 'text-white/45'}>{bar(n, max).on}</span>
              <span className="text-white/10">{bar(n, max).off}</span>
            </span>
            <span className="ml-auto shrink-0 tabular-nums text-white/30">{n}</span>
          </button>
        )
      })}
    </div>
  )
}

/** `ls` proper: all 56 in a couple of screens, one dense row each. */
function ListView({
  list,
  sel,
  onHover,
  onOpen,
  cat,
}: {
  list: Certificate[]
  sel: number
  onHover: (i: number) => void
  onOpen: (c: Certificate) => void
  cat: string
}) {
  const COLS =
    'grid-cols-[12px_34px_minmax(0,1fr)] sm:grid-cols-[12px_34px_44px_54px_minmax(0,1fr)] lg:grid-cols-[12px_34px_44px_54px_minmax(0,1.9fr)_minmax(0,1.2fr)_minmax(0,0.9fr)]'
  return (
    <div className="glass-panel overflow-hidden rounded-2xl">
      <div
        className={`grid ${COLS} gap-3 border-b border-white/10 px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-white/30`}
      >
        <span />
        <span />
        <span className="hidden sm:block">lvl</span>
        <span className="hidden sm:block">date</span>
        <span>title</span>
        <span className="hidden lg:block">issuer</span>
        <span className="hidden lg:block">result</span>
      </div>

      <div className="divide-y divide-white/5">
        {list.map((c, i) => {
          const on = i === sel
          return (
            <button
              key={`${cat}:${c.file}`}
              data-row={i}
              onMouseEnter={() => onHover(i)}
              onClick={() => onOpen(c)}
              className={`grid w-full ${COLS} items-center gap-3 px-3 py-1.5 text-left font-mono text-[12px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white ${
                on ? 'bg-white/[0.09]' : 'hover:bg-white/[0.05]'
              }`}
            >
              <span className={`select-none ${on ? 'text-white' : 'text-transparent'}`}>
                &#9656;
              </span>
              <span className="h-6 w-[34px] overflow-hidden rounded-sm bg-white/90">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={certThumb(c.file)}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </span>
              <span
                className={`hidden text-[10px] tracking-wider sm:block ${
                  c.level === 'International' || c.level === 'National'
                    ? 'text-white/75'
                    : 'text-white/35'
                }`}
              >
                {c.level ? LEVEL_TAG[c.level] ?? c.level.slice(0, 4).toUpperCase() : '----'}
              </span>
              <span className="hidden tabular-nums text-white/35 sm:block">
                {certStampLabel(c)}
              </span>
              <span className={`truncate ${on ? 'text-white' : 'text-white/85'}`}>
                {c.medal && (
                  <span className="mr-1.5 text-white" aria-hidden>
                    {c.medal === 'gold' ? '★' : '◆'}
                  </span>
                )}
                {c.title}
              </span>
              <span className="hidden truncate text-white/40 lg:block">{c.issuer}</span>
              <span className="hidden truncate text-white/40 lg:block">{c.result}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
