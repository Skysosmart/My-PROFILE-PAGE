import { certificates, assets, type Certificate } from '@/data/portfolio'

export const certSrc = (file: string) => assets.certDir + encodeURIComponent(file)
export const certThumb = (file: string) =>
  assets.certDir + 'thumbs/' + encodeURIComponent(file)

/** First matching rule wins; every cert lands in exactly one category. */
export function categorize(c: Certificate): string {
  const s = `${c.title} ${c.issuer} ${c.file}`
  if (/makex|robot/i.test(s)) return 'robotics'
  if (/EC[_-]?Council|NDE|EHE|CTF|cyber|NCSA|RTARF|pentest|IT CLASH/i.test(s)) return 'security'
  if (/\bAI\b|BOTNOI|python|\bdata\b|typhoon|CiRA|prompt|digital twin|semiconductor/i.test(s))
    return 'ai-data'
  if (/\bENG\b|english|INTER/i.test(s)) return 'language'
  return 'misc'
}

export const CATS: { key: string; label: string; chip: string; dot: string }[] = [
  { key: 'all', label: 'All', chip: 'bg-neutral-200 text-neutral-700', dot: 'bg-white' },
  { key: 'featured', label: 'Featured', chip: 'bg-neutral-100 text-neutral-900', dot: 'bg-white' },
  { key: 'robotics', label: 'Robotics', chip: 'bg-orange-100 text-orange-800', dot: 'bg-orange-500' },
  { key: 'security', label: 'Security', chip: 'bg-emerald-100 text-emerald-800', dot: 'bg-emerald-500' },
  { key: 'ai-data', label: 'AI & Data', chip: 'bg-violet-100 text-violet-800', dot: 'bg-violet-500' },
  { key: 'language', label: 'Language', chip: 'bg-sky-100 text-sky-800', dot: 'bg-sky-500' },
  { key: 'misc', label: 'More', chip: 'bg-neutral-200 text-neutral-700', dot: 'bg-neutral-400' },
]

export const catMeta = (k: string) => CATS.find((c) => c.key === k) ?? CATS[CATS.length - 1]

export const LEVEL_TAG: Record<string, string> = {
  International: 'INTL',
  National: 'NATL',
  Provincial: 'PROV',
  Institution: 'INST',
  School: 'SCH',
  Online: 'ONL',
}

/** key -> certificates, shared by the home section and the full page. */
export function groupByCategory() {
  const m = new Map<string, Certificate[]>()
  m.set('all', [...certificates])
  m.set('featured', certificates.filter((c) => c.featured))
  certificates.forEach((c) => {
    const k = categorize(c)
    m.set(k, [...(m.get(k) ?? []), c])
  })
  return m
}

export const certStats = {
  total: certificates.length,
  gold: certificates.filter((c) => c.medal === 'gold').length,
  national: certificates.filter((c) => c.level === 'National').length,
  intl: certificates.filter((c) => c.level === 'International').length,
}

/* --------------------------------------------------------------------------
   Sorting, searching and the little histograms the archive rail draws.
   -------------------------------------------------------------------------- */

const MONTHS = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec']

/** '2026' from 'Jan 2026' or 'Oct-Nov 2025'; null when a cert carries no date. */
export function certYear(c: Certificate): string | null {
  const m = c.date?.match(/20\d\d/)
  return m ? m[0] : null
}

/**
 * A sortable stamp: year * 100 + month, so 'Jan 2026' > 'Dec 2025'.
 * A range like 'Oct-Nov 2025' sorts on the month it started.
 * Undated certificates get 0 and fall to the end of a newest-first sort.
 */
export function certStamp(c: Certificate): number {
  const y = certYear(c)
  if (!y) return 0
  const m = c.date?.toLowerCase().match(/jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec/)
  return Number(y) * 100 + (m ? MONTHS.indexOf(m[0]) + 1 : 0)
}

/** 'YYYY-MM' for the list view's date column, '   -   ' when undated. */
export function certStampLabel(c: Certificate): string {
  const s = certStamp(c)
  if (!s) return '----.--'
  const mm = s % 100
  return `${Math.floor(s / 100)}.${mm ? String(mm).padStart(2, '0') : '--'}`
}

/** Most selective first, so sorting by level puts the biggest stages on top. */
const LEVEL_RANK: Record<string, number> = {
  International: 0,
  National: 1,
  Provincial: 2,
  Institution: 3,
  School: 4,
  Online: 5,
}
export const levelRank = (c: Certificate) =>
  c.level ? (LEVEL_RANK[c.level] ?? 9) : 9

export type SortKey = 'date' | 'level' | 'name'

/** Sorted copy. `dir` is 1 for the natural order of the key, -1 to reverse. */
export function sortCerts(list: Certificate[], key: SortKey, dir: 1 | -1) {
  const out = [...list]
  out.sort((a, b) => {
    let d = 0
    // natural order: newest first, biggest stage first, A before Z
    if (key === 'date') d = certStamp(b) - certStamp(a)
    else if (key === 'level') d = levelRank(a) - levelRank(b)
    else d = a.title.localeCompare(b.title)
    // ties resolve by date so the order is stable and never arbitrary
    if (d === 0) d = certStamp(b) - certStamp(a)
    return d * dir
  })
  return out
}

/** Free-text match across everything a person might type. */
export function certMatches(c: Certificate, q: string) {
  if (!q) return true
  const hay = `${c.title} ${c.issuer} ${c.result ?? ''} ${c.level ?? ''} ${c.date ?? ''} ${c.detail ?? ''}`
  return hay.toLowerCase().includes(q.toLowerCase())
}

/** [label, count] rows for the rail, biggest first. */
function tally(pick: (c: Certificate) => string | null) {
  const m = new Map<string, number>()
  certificates.forEach((c) => {
    const k = pick(c)
    if (k) m.set(k, (m.get(k) ?? 0) + 1)
  })
  return [...m.entries()]
}

export const byLevel = tally((c) => c.level ?? null).sort(
  (a, b) => (LEVEL_RANK[a[0]] ?? 9) - (LEVEL_RANK[b[0]] ?? 9),
)
export const byYear = tally(certYear).sort((a, b) => b[0].localeCompare(a[0]))

/**
 * Eight-step block bar, split so the two halves can be coloured apart - drawn
 * as one string the filled part is indistinguishable from the empty part.
 */
export function bar(n: number, max: number, width = 8) {
  const filled = max > 0 ? Math.round((n / max) * width) : 0
  // never let a non-zero count render as nothing
  const on = n > 0 ? Math.max(filled, 1) : 0
  return { on: '\u2588'.repeat(on), off: '\u2591'.repeat(Math.max(width - on, 0)) }
}
