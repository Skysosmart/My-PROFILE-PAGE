import { about, certificates, contact, player, projects, type Certificate } from '@/data/portfolio'
import { categorize, certStats } from '@/lib/certs'

/**
 * What the one-page CV says, chosen from the same data the site renders.
 * Nothing here is written twice: a project or certificate edited in
 * data/portfolio.ts changes the PDF on the next build.
 *
 * One page is the whole constraint. The site can show 56 certificates and
 * 11 projects at full length; the CV shows the strongest of each and points
 * at the site for the rest.
 *
 * Everything is ordered by weight, never by date: a CV is read top-down
 * and often not to the bottom, so the gold medal goes above the third
 * place whatever year each was won.
 */

// Awarded work first, then the largest production contribution, then the
// rest. Matched on a leading word so a title can be reworded freely.
const PROJECT_PICKS = ['PDLite', 'Nexus', 'MakeX', 'Seluna', 'Doodee Future Extension', 'Hackathon Digitize']

export const cvProjects = PROJECT_PICKS.flatMap((k) => {
  const p = projects.find((q) => q.title.startsWith(k))
  return p ? [p] : []
})

/** 'PDLite' from 'PDLite - Parkinson's Risk Screening Device'. */
export const shortTitle = (t: string) => t.split(' - ')[0]

/** The first sentence of a description: the CV has one line per project. */
export const firstSentence = (s: string) => s.match(/^.*?[.!?](?=\s|$)/)?.[0] ?? s

// A placing or a medal is an award; everything else is training.
const isAward = (c: Certificate) => !!c.medal || /\bplace\b|finalist|top \d+/i.test(c.result ?? '')

// A certificate's weight: a medal outranks a placing outranks a finalist
// outranks a top-N; featured before not; a higher level before a lower.
// Ties keep the data file's order, which is the site's own curated one.
const MEDAL: Record<string, number> = { gold: 30, silver: 20, bronze: 10 }
const LEVEL: Record<string, number> = {
  International: 4,
  National: 3,
  Provincial: 2,
  Institution: 2,
  School: 1,
  Online: 1,
}
const weight = (c: Certificate) => {
  const r = c.result ?? ''
  const award = c.medal
    ? MEDAL[c.medal]
    : /\bplace\b/i.test(r)
      ? 8
      : /finalist/i.test(r)
        ? 5
        : /top \d+/i.test(r)
          ? 3
          : 0
  return award * 100 + (c.featured ? 50 : 0) + (LEVEL[c.level ?? ''] ?? 0) * 10
}
const byWeight = (list: Certificate[]) =>
  list
    .map((c, i) => ({ c, i }))
    .sort((a, b) => weight(b.c) - weight(a.c) || a.i - b.i)
    .map((x) => x.c)

export const cvAwards = byWeight(certificates.filter(isAward))

// Security training, one entry per programme (the RTARF bootcamp has two
// certificates for one course), as many as the column holds.
const TRAINING_MAX = 6
export const cvTraining = (() => {
  const seen = new Set<string>()
  return byWeight(certificates.filter((c) => !isAward(c) && categorize(c) === 'security'))
    .filter((c) => {
      const key = c.title.split(' - ')[0]
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .slice(0, TRAINING_MAX)
})()

// Grouped by hand because tags are per project, not per person - but every
// item below is something a project's tags or a certificate on the site
// already claims.
export const cvSkills = [
  { key: 'Web', value: 'Next.js · React · TypeScript · Astro · Tailwind CSS' },
  { key: 'Backend & data', value: 'Supabase · Prisma · Python · OCR / NER pipelines' },
  { key: 'Security', value: 'Pentesting fundamentals · CTF · Network defense · Ethical hacking' },
  { key: '3D & design', value: 'Fusion 360 · Three.js / WebGL · UI & graphic design' },
]

const channel = (key: string) => contact.channels.find((c) => c.key === key)

export const cvIdentity = {
  name: player.name,
  handle: player.handle,
  role: player.role,
  summary: about.paragraphs[0],
  email: channel('EMAIL')?.value ?? '',
  github: channel('GITHUB')?.value ?? '',
  school: channel('SCHOOL')?.value ?? '',
  // from the Statement of Purpose, the one role there that is not a project
  activity: 'ACT Brand Ambassador · Content Creator',
  stats: `${certStats.total} certificates · ${certStats.gold} gold medals · ${certStats.national} national · ${certStats.intl} international`,
}
