import type { Lang } from '@/lib/lang'

/**
 * A piece of prose in both languages. Only prose is bilingual: keys, file
 * names, URLs, tags, dates and certificate titles stay single-valued, so the
 * search and the regexes in lib/certs.ts never have to know about this.
 */
export type L = { en: string; th: string }
export type Text = string | L

/** Build a bilingual string. */
export const l = (en: string, th: string): L => ({ en, th })

/** Read a Text in a language; a plain string is the same in both. */
export const pick = (v: Text, lang: Lang): string =>
  typeof v === 'string' ? v : v[lang] || v.en

/** Map a list of Text to one language. */
export const pickAll = (vs: readonly Text[], lang: Lang): string[] => vs.map((v) => pick(v, lang))
