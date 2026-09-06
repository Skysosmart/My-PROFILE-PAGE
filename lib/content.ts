import type { Lang } from '@/lib/lang'
import { about, contact, education, inspiration, player, profile, projects, skills, sop } from '@/data/portfolio'
import { aboutTh, contactTh, educationTh, inspirationTh, playerTh, profileTh, projectsTh, skillsTh, sopTh } from '@/data/portfolio.th'

/**
 * The site's prose in one language. English is data/portfolio.ts as it is;
 * Thai lays data/portfolio.th.ts over it, prose fields only, so every key,
 * file, URL and tag is the same object in both. Anything that must stay
 * English (the CV, the JSON-LD, the metadata) keeps importing the data file
 * directly and never sees this.
 */
export function localize(lang: Lang) {
  if (lang !== 'th') return { player, about, sop, inspiration, projects, contact, profile, education, skills }
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
    education: education.map((ch, n) => ({ ...ch, ...educationTh[n] })),
    skills: skills.map((g) => ({
      ...g,
      label: skillsTh.labels[g.key] ?? g.label,
      skills: g.skills.map((sk) => ({ ...sk, note: skillsTh.notes[sk.name] ?? sk.note })),
    })),
  }
}

export type Content = ReturnType<typeof localize>
