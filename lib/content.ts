import type { Lang } from '@/lib/lang'
import { about, contact, inspiration, player, profile, projects, sop } from '@/data/portfolio'
import { aboutTh, contactTh, inspirationTh, playerTh, profileTh, projectsTh, sopTh } from '@/data/portfolio.th'

/**
 * The site's prose in one language. English is data/portfolio.ts as it is;
 * Thai lays data/portfolio.th.ts over it, prose fields only, so every key,
 * file, URL and tag is the same object in both. Anything that must stay
 * English (the CV, the JSON-LD, the metadata) keeps importing the data file
 * directly and never sees this.
 */
export function localize(lang: Lang) {
  if (lang !== 'th') return { player, about, sop, inspiration, projects, contact, profile }
  return {
    player: { ...player, ...playerTh },
    about: {
      ...about,
      paragraphs: aboutTh.paragraphs,
      facts: about.facts.map((f) => ({ ...f, value: aboutTh.facts[f.key] ?? f.value })),
    },
    sop: { ...sop, paragraphs: sopTh.paragraphs },
    inspiration: inspiration.map((i, n) => ({ ...i, ...inspirationTh[n] })),
    projects: projects.map((p) => ({ ...p, ...projectsTh[p.title] })),
    contact: { ...contact, ...contactTh },
    profile: {
      ...profile,
      location: profileTh.location,
      status: profileTh.status,
      mbti: { ...profile.mbti, ...profileTh.mbti },
    },
  }
}

export type Content = ReturnType<typeof localize>
