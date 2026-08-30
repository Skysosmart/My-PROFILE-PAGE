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
