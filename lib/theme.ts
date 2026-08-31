/**
 * Theme: 'dark' is the site as designed, 'light' is the same terminal printed
 * on paper. The choice lives on <html data-theme>; the CSS tokens in
 * globals.css do everything else.
 *
 * Preference vs theme: a visitor either picked one ('light' | 'dark', kept in
 * localStorage) or has not ('system', which follows prefers-color-scheme and
 * keeps following it if the OS flips at night).
 */

export type Theme = 'light' | 'dark'
export type Pref = Theme | 'system'

const KEY = 'theme'

/** Inline in <head>: applies the theme before first paint, so no flash. */
export const THEME_BOOT = `(function(){try{var v=localStorage.getItem('${KEY}');var t=(v==='light'||v==='dark')?v:(matchMedia('(prefers-color-scheme: light)').matches?'light':'dark');document.documentElement.dataset.theme=t}catch(e){}})()`

export function getPref(): Pref {
  try {
    const v = localStorage.getItem(KEY)
    return v === 'light' || v === 'dark' ? v : 'system'
  } catch {
    return 'system'
  }
}

export const systemTheme = (): Theme =>
  window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'

export const currentTheme = (): Theme =>
  (document.documentElement.dataset.theme as Theme | undefined) ?? 'dark'

/** Persist the preference, stamp the resolved theme, tell every canvas. */
export function applyPref(p: Pref) {
  try {
    if (p === 'system') localStorage.removeItem(KEY)
    else localStorage.setItem(KEY, p)
  } catch {}
  const t: Theme = p === 'system' ? systemTheme() : p
  document.documentElement.dataset.theme = t
  window.dispatchEvent(new CustomEvent<Theme>('themechange', { detail: t }))
}

/** For the effects that paint colours from JS rather than CSS. */
export function onThemeChange(fn: (t: Theme) => void) {
  const h = (e: Event) => fn((e as CustomEvent<Theme>).detail)
  window.addEventListener('themechange', h)
  return () => window.removeEventListener('themechange', h)
}

/** The ink / page colours as CSS strings, for canvases. */
export function inkColors() {
  const cs = getComputedStyle(document.documentElement)
  const fg = cs.getPropertyValue('--fg').trim().split(/\s+/).join(',')
  const bg = cs.getPropertyValue('--bg').trim().split(/\s+/).join(',')
  return { fg: (a = 1) => `rgba(${fg},${a})`, bg: (a = 1) => `rgba(${bg},${a})` }
}
