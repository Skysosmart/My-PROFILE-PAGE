/**
 * The page's ink and paper, as CSS strings, for the effects that paint from
 * JS rather than CSS (the orb's face, the ASCII hand). They read the same
 * --fg / --bg tokens globals.css sets, so there is one source of colour.
 *
 * This used to be lib/theme.ts and carried a dark/light switch with it; the
 * site is one palette now, so nothing subscribes to a change any more.
 */
export function inkColors() {
  const cs = getComputedStyle(document.documentElement)
  const fg = cs.getPropertyValue('--fg').trim().split(/\s+/).join(',')
  const bg = cs.getPropertyValue('--bg').trim().split(/\s+/).join(',')
  return { fg: (a = 1) => `rgba(${fg},${a})`, bg: (a = 1) => `rgba(${bg},${a})` }
}
