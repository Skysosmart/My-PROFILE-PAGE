/**
 * Language: 'en' is the site as written, 'th' is the same site in Thai.
 * Modelled on lib/theme.ts on purpose: the choice lives on <html lang> and
 * <html data-lang>, is remembered in localStorage, and is applied before
 * first paint by an inline script so a Thai reader never sees an English
 * flash. No routing: every page is one URL in both languages, which is
 * what a client-rendered one-pager can do honestly.
 *
 * Default is the browser's language, Thai if it says so, else English.
 */

export type Lang = 'en' | 'th'

const KEY = 'lang'
export const LANGS: Lang[] = ['en', 'th']

/** Inline in <head>: stamps the language before first paint. */
export const LANG_BOOT = `(function(){try{var v=localStorage.getItem('${KEY}');var l=(v==='th'||v==='en')?v:(((navigator.language||'').toLowerCase().indexOf('th')===0)?'th':'en');document.documentElement.lang=l;document.documentElement.dataset.lang=l}catch(e){}})()`

export const isLang = (v: unknown): v is Lang => v === 'en' || v === 'th'

export const currentLang = (): Lang => {
  if (typeof document === 'undefined') return 'en'
  const v = document.documentElement.dataset.lang
  return isLang(v) ? v : 'en'
}

/** Persist the choice, stamp <html>, tell every listener. */
export function applyLang(l: Lang) {
  try {
    localStorage.setItem(KEY, l)
  } catch {}
  document.documentElement.lang = l
  document.documentElement.dataset.lang = l
  window.dispatchEvent(new CustomEvent<Lang>('langchange', { detail: l }))
}

export function onLangChange(fn: (l: Lang) => void) {
  const h = (e: Event) => fn((e as CustomEvent<Lang>).detail)
  window.addEventListener('langchange', h)
  return () => window.removeEventListener('langchange', h)
}
