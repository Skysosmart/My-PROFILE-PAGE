#!/usr/bin/env node
// Generates the 180-frame ZaruTech duck opening (3 s @ 60 fps) as SVG files.
// Run: node scripts/gen-duck-opening.mjs   ->  public/duck/opening/frame-001.svg ... frame-180.svg
// Every frame: 1920x1080 viewBox, transparent, groups #cover / #duck / #fx.
// The homepage is NOT drawn; the cover's lower edge uncovers whatever sits underneath.
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// SUB=2 renders 120 fps worth of frames (poses evaluated at half-frames); OUT_DIR overrides the output folder
const SUB = Number(process.env.SUB || 1)
const OUT = process.env.OUT_DIR || join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'duck', 'opening')
const W = 1920, H = 1080, FRAMES = 180
const INK = '#111', BODY = '#FBF8F0', ORANGE = '#F7C05A', PAPER = '#EFEADF', PAPER_EDGE = '#D8D1C0'
// "ZaruTech" + underline swoosh, traced from public/duck/stand-light.png (potrace), 262x150 box
const TEXT_D = 'M215 147 c0 -13 6 -38 10 -39 2 0 6 2 6 4 0 3 6 13 7 13 1 0 2 -3 3 -6 3 -8 4 -10 7 -10 7 1 -1 27 -9 27 -3 0 -10 -6 -10 -8 0 -3 -2 0 -3 5 -3 15 -4 17 -8 17 -3 0 -3 0 -3 -3z M156 134 c-15 -7 -20 -9 -21 -12 0 -3 3 -3 9 -1 7 3 7 3 6 -11 0 -16 1 -23 3 -26 3 -3 4 -1 3 21 l0 21 7 3 c15 7 7 11 -7 5z M198 127 c-13 -6 -10 -24 3 -24 7 0 15 8 12 12 -1 1 -2 1 -5 -1 -10 -8 -15 1 -4 9 6 5 2 8 -6 4z M170 121 c-13 -10 -2 -31 13 -23 5 2 4 5 -1 5 -8 0 -11 2 -5 3 4 1 9 7 9 10 0 8 -10 11 -16 5z m8 -4 c1 -1 -5 -6 -6 -5 0 1 0 2 1 3 2 3 4 4 5 2z M118 102 c-2 0 -5 -3 -7 -5 -4 -3 -4 -3 -6 -1 -6 8 -8 3 -5 -14 3 -15 4 -14 -1 -12 -4 2 -6 5 -6 11 -1 7 -6 12 -13 12 -11 0 -17 -10 -5 -10 5 0 6 -1 6 -3 0 -6 -6 -13 -8 -9 -2 6 -6 4 -6 -2 0 -2 0 -3 -4 -4 -2 -1 -7 -4 -11 -6 -4 -2 -7 -4 -8 -4 0 0 4 8 8 17 14 32 13 34 -14 23 -23 -9 -29 -13 -29 -16 0 -5 5 -4 22 3 9 4 16 7 16 7 1 0 2 2 -9 -21 -11 -25 -12 -26 -10 -30 3 -3 7 -3 16 3 22 13 30 18 32 18 4 0 9 3 11 6 1 3 1 3 5 0 4 -2 9 -3 11 -1 1 1 2 2 3 1 4 -1 7 4 7 12 0 9 1 11 8 18 7 8 6 11 -3 7z M137 102 c-1 -1 -1 -4 -1 -6 -2 -8 -4 -9 -5 -3 -3 8 -5 7 -5 -2 1 -11 6 -16 12 -10 2 3 4 14 4 19 -1 3 -5 5 -5 2z M201 77 c-61 -17 -115 -41 -148 -66 -14 -11 -14 -11 -5 -11 8 0 8 0 19 8 15 11 26 17 43 24 13 6 95 40 107 44 3 1 6 2 6 3 0 3 -8 2 -22 -2z'

// ---------- helpers ----------
const clamp = (v, a, b) => Math.min(b, Math.max(a, v))
const lerp = (a, b, t) => a + (b - a) * t
const smooth = (t) => t * t * (3 - 2 * t)
const rad = (d) => (d * Math.PI) / 180
const n1 = (v) => Math.round(v * 10) / 10
function rng(seed) {
  let s = (seed * 2654435761) >>> 0
  return () => ((s = (Math.imul(s ^ (s >>> 15), 2246822507) + 0x9e3779b9) >>> 0) / 4294967296 - 0.5) * 2
}
// closed/open Catmull-Rom -> cubic path
function curve(pts, closed = true) {
  const p = pts, n = p.length
  const g = (i) => (closed ? p[(i + n) % n] : p[clamp(i, 0, n - 1)])
  let d = `M${n1(p[0][0])} ${n1(p[0][1])}`
  const last = closed ? n : n - 1
  for (let i = 0; i < last; i++) {
    const p0 = g(i - 1), p1 = g(i), p2 = g(i + 1), p3 = g(i + 2)
    d += `C${n1(p1[0] + (p2[0] - p0[0]) / 6)} ${n1(p1[1] + (p2[1] - p0[1]) / 6)} ${n1(p2[0] - (p3[0] - p1[0]) / 6)} ${n1(p2[1] - (p3[1] - p1[1]) / 6)} ${n1(p2[0])} ${n1(p2[1])}`
  }
  return d + (closed ? 'Z' : '')
}
// ribbon along a quadratic bezier a->c->b, half widths w0->w1 (with optional belly)
function ribbon(a, c, b, w0, w1, belly = 0, steps = 9) {
  const L = [], R = []
  for (let i = 0; i <= steps; i++) {
    const t = i / steps, u = 1 - t
    const x = u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], y = u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]
    const dx = 2 * u * (c[0] - a[0]) + 2 * t * (b[0] - c[0]), dy = 2 * u * (c[1] - a[1]) + 2 * t * (b[1] - c[1])
    const m = Math.hypot(dx, dy) || 1, nx = -dy / m, ny = dx / m
    const w = lerp(w0, w1, t) + belly * Math.sin(Math.PI * t)
    L.push([x + nx * w, y + ny * w]); R.push([x - nx * w, y - ny * w])
  }
  return [...L, ...R.reverse()]
}
const jit = (pts) => pts

// ---------- keyframes ----------
// u/uR: left/right wing raise (0 rest -> 1 up), pinch: both fists brought together above the head,
// st: leg stance (0 narrow -> 1 wide, braced)
const DEF = { x: 960, hop: 0, sq: 1, lean: 0, neckL: 170, headRot: 0, nx: -30, u: 0, uR: 0, pinch: 0, st: 0, reach: 1, glass: 0, cap: 0, look: 0 }
// [frame, {param: value}] ; params not listed keep their previous value
const KEYS = [
  [1, {}], [6, { sq: 0.95 }], [9, { sq: 1.04, hop: 6 }], [12, { sq: 1, hop: 0 }],
  [24, { lean: -3, headRot: -2, cap: -2, st: 0.12 }], [30, {}],
  [34, { headRot: 4, nx: -24, look: 0.4 }], [42, { headRot: -24, nx: -40, neckL: 184, lean: -5, look: 1, st: 0.2 }],
  [48, { u: 0.25, lean: -4 }], [54, { u: 0.62, headRot: -26, neckL: 196 }],
  [60, { u: 0.82, neckL: 220, sq: 1.03, lean: 0, st: 0.3 }], [66, { u: 0.96, reach: 1.3, neckL: 246, sq: 1.05, lean: 4, headRot: -22, st: 0.4 }],
  [72, { u: 1, reach: 1.42, neckL: 254, sq: 1.06, lean: 3 }], [78, { lean: 1, glass: 3 }],
  [84, { lean: 12, sq: 0.9, neckL: 220, headRot: -14, glass: 5, st: 0.6 }], [90, { lean: 14, sq: 0.88, neckL: 210, st: 0.8 }],
  [96, { lean: 5, sq: 1.02, neckL: 195, headRot: -18, uR: 1, st: 0.9 }], [102, { lean: 18, sq: 1.08, neckL: 155, glass: -6, pinch: 1, st: 1, headRot: -14 }],
  [108, { lean: 13, sq: 1.05, glass: 6 }], [114, { lean: 19, sq: 1.08, glass: -5 }],
  [120, { lean: 14, sq: 1.05, glass: 5 }], [126, { lean: 19, sq: 1.08, glass: -4 }],
  [132, { lean: 15, sq: 1.05, glass: 4 }], [138, { lean: 19, sq: 1.07, glass: -4 }],
  [144, { lean: 15, sq: 1.05, glass: 4 }], [150, { lean: 20, sq: 1.09, glass: -3 }],
  [153, { lean: -12, sq: 0.9, neckL: 174, u: 0.5, uR: 0.5, pinch: 0.2, reach: 1, headRot: 4, glass: 8, hop: 0, st: 0.5 }],
  [156, { lean: -3, sq: 1.08, neckL: 184, u: 0.2, uR: 0, pinch: 0, hop: 46, headRot: -4, glass: -4 }],
  [160, { sq: 1.02, hop: 60, x: 640, lean: 3, u: 0, st: 0.2 }], [164, { hop: 0, x: 440, sq: 0.86, lean: 2, neckL: 168, headRot: 0, glass: 0, st: 0.3 }],
  [168, { sq: 1.03, lean: -2, neckL: 172, st: 0.12 }], [170, { headRot: 9, nx: -26, lean: -1, sq: 1 }],
  [173, { headRot: -6, u: 0.3, lean: -3 }], [176, { headRot: -2, u: 0.08, lean: -2 }], [180, { headRot: -1, u: 0, lean: -2, sq: 1.01 }],
]
// monotone cubic Hermite through the keys: continuous velocity (no stop at every key), no overshoot
const TRACKS = (() => {
  const tr = {}
  let prev = { ...DEF }
  const rows = KEYS.map(([kf, kv]) => ({ f: kf, v: (prev = { ...prev, ...kv }) }))
  for (const k of Object.keys(DEF)) {
    const xs = rows.map((r) => r.f), ys = rows.map((r) => r.v[k]), n = xs.length
    const d = [], m = new Array(n).fill(0)
    for (let i = 0; i < n - 1; i++) d.push((ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]))
    for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2
    m[0] = d[0]; m[n - 1] = d[n - 2]
    for (let i = 0; i < n - 1; i++) {
      if (d[i] === 0) { m[i] = 0; m[i + 1] = 0; continue }
      const a = m[i] / d[i], b = m[i + 1] / d[i], h = Math.hypot(a, b)
      if (h > 3) { m[i] = (3 * a * d[i]) / h; m[i + 1] = (3 * b * d[i]) / h }
    }
    tr[k] = { xs, ys, m }
  }
  return tr
})()
function params(f) {
  const P = {}
  for (const k of Object.keys(DEF)) {
    const { xs, ys, m } = TRACKS[k]
    let i = xs.findIndex((x) => f <= x)
    if (i <= 0) { P[k] = ys[Math.max(i, 0)]; continue }
    i -= 1
    const h = xs[i + 1] - xs[i], t = (f - xs[i]) / h, t2 = t * t, t3 = t2 * t
    P[k] = (2 * t3 - 3 * t2 + 1) * ys[i] + (t3 - 2 * t2 + t) * h * m[i] + (-2 * t3 + 3 * t2) * ys[i + 1] + (t3 - t2) * h * m[i + 1]
  }
  return P
}

// ---------- rig ----------
const S = 0.88, GROUND = 1040, PIV = [0, -190]
function bodyMat(p) {
  // local ground coords -> screen. squash about the hip pivot, then lean, then place.
  const sy = p.sq, sx = 1 + (1 - p.sq) * 0.7, a = rad(p.lean), ca = Math.cos(a), sa = Math.sin(a)
  return ([x, y]) => {
    const px = (x - PIV[0]) * sx, py = (y - PIV[1]) * sy
    const rx = px * ca - py * sa, ry = px * sa + py * ca
    return [p.x + (rx + PIV[0]) * S, GROUND - p.hop + (ry + PIV[1]) * S]
  }
}
// side -1 = picture-left wing (hand on hip at rest), +1 = picture-right (tucked behind the body)
function wing(p, side) {
  const u = side < 0 ? p.u : p.uR
  const s = [side * 118, -430], len = 165 * lerp(1, p.reach, u)
  const a1 = lerp(132, 245, u), a2 = lerp(36, 262, u) + 36 * p.pinch * u
  const m = (a) => (side < 0 ? a : 180 - a)
  const e = [s[0] + len * Math.cos(rad(m(a1))), s[1] + len * Math.sin(rad(m(a1)))]
  const t = [e[0] + len * Math.cos(rad(m(a2))), e[1] + len * Math.sin(rad(m(a2)))]
  return { s, e, t, dir: m(a2), u }
}
function tipScreen(p) {
  const M = bodyMat(p), l = M(wing(p, -1).t), r = M(wing(p, 1).t), k = p.uR > 0.5 ? (p.uR - 0.5) * 2 : 0
  return [lerp(l[0], r[0], k * 0.5), lerp(l[1], r[1], k * 0.5)]
}

function duck(p, f, seed) {
  const r = rng(seed)
  const g = []
  const sw = 9
  const sy = p.sq, sx = 1 + (1 - p.sq) * 0.7
  const bt = `translate(${n1(p.x)} ${n1(GROUND - p.hop)}) scale(${S}) translate(0 ${PIV[1]}) rotate(${n1(p.lean)}) scale(${n1(sx * 1000) / 1000} ${n1(sy * 1000) / 1000}) translate(0 ${-PIV[1]})`
  // shadow + legs (ground frame, behind the body)
  const sh = clamp(1 - p.hop / 160, 0.3, 1)
  g.push(`<ellipse cx="${n1(p.x)}" cy="${GROUND + 6}" rx="${n1((250 + p.st * 90) * S * sh)}" ry="${n1(24 * S * sh)}" fill="#000" opacity="${n1(0.1 * sh * 10) / 10}"/>`)
  const M = bodyMat(p)
  const lh = M([-48, -202]), rh = M([62, -206])
  const la = [p.x + lerp(-66, -170, p.st) * S, GROUND - 22 * S], ra = [p.x + lerp(84, 205, p.st) * S, GROUND - 22 * S]
  const leg = (h, a) => {
    const d = `M${n1(h[0])} ${n1(h[1])}L${n1(a[0])} ${n1(a[1] - 4)}`
    return `<path d="${d}" stroke="#fff" stroke-opacity="0.4" stroke-width="${n1(sw * S * 2.4)}" stroke-linecap="round" fill="none"/><path d="${d}" stroke="${INK}" stroke-width="${n1(sw * S * 0.85)}" stroke-linecap="round" fill="none"/>`
  }
  g.push(leg(lh, la), leg(rh, ra))
  // webbed foot, toes outward
  const foot = (a, dir, rot) => `<path transform="translate(${n1(a[0])} ${n1(a[1])}) rotate(${rot}) scale(${n1(S * dir * 100) / 100} ${S})" d="M-20 -6C-2-18 34-24 74-20L98-10L82-4L98 6L74 10L84 20C56 26 18 24-10 15C-22 9-24 0-20-6Z" fill="${ORANGE}" stroke="${INK}" stroke-width="${sw}" stroke-linejoin="round"/>`
  g.push(foot(la, -1, n1(-8 * p.st)), foot(ra, 1, n1(8 * p.st)))

  const b = []
  const wL = wing(p, -1), wR = wing(p, 1)
  const wShape = (w) => {
    const rib = ribbon(w.s, w.e, w.t, 27, 14, 3)
    const ang = rad(w.dir), dx = Math.cos(ang), dy = Math.sin(ang), px = -dy, py = dx
    const c = [[w.t[0] + dx * 8, w.t[1] + dy * 8, 21], [w.t[0] + dx * 20 + px * 14, w.t[1] + dy * 20 + py * 14, 15], [w.t[0] + dx * 20 - px * 14, w.t[1] + dy * 20 - py * 14, 15]]
    return { d: curve(rib), c: c.map(([x, y, rr]) => `<circle cx="${n1(x)}" cy="${n1(y)}" r="${rr}"/>`).join(''), rib }
  }
  const standalone = (w) => {
    const s2 = wShape(w)
    return `<g fill="${INK}" stroke="${INK}" stroke-width="${sw * 2}" stroke-linejoin="round"><path d="${s2.d}"/>${s2.c}</g><g fill="${BODY}"><path d="${s2.d}"/>${s2.c}</g>`
  }
  // raised arms sit behind the body so their roots tuck under it
  if (p.uR > 0.04) b.push(standalone(wR))
  const leftFront = p.u < 0.45
  if (!leftFront) b.push(standalone(wL))
  // ---- body, neck, head as one silhouette (the resting left arm joins it: elbow bump, hand on hip)
  const body = [[-80, -482], [-104, -420], [-136, -345], [-142, -275], [-98, -218], [-26, -192], [54, -194], [112, -226], [152, -292], [148, -372], [116, -442], [76, -488]]
  const H0 = [-24 + p.nx, -458 - p.neckL]
  const neck = ribbon([-6, -440], [-14 + p.nx * 0.3 + 18, -440 - p.neckL * 0.5], H0, 70, 58, -2)
  const head = `<ellipse cx="${n1(H0[0])}" cy="${n1(H0[1])}" rx="92" ry="80"`
  const sL = wShape(wL)
  const front = leftFront ? `<path d="${sL.d}"/>${sL.c}` : ''
  b.push(`<g fill="${INK}" stroke="${INK}" stroke-width="${sw * 2}" stroke-linejoin="round"><path d="${curve(body)}"/><path d="${curve(neck)}"/>${head}/>${front}</g>`)
  b.push(`<g fill="${BODY}"><path d="${curve(body)}"/><path d="${curve(neck)}"/>${head}/>${front}</g>`)
  b.push(`<g transform="translate(-86 -372) scale(0.78)"><g transform="translate(0 150) scale(1 -1)"><path d="${TEXT_D}" fill="${INK}"/></g></g>`)
  if (leftFront) b.push(`<path d="${curve(sL.rib)}" fill="none" stroke="${INK}" stroke-width="${sw * 0.8}" stroke-linejoin="round" opacity="${n1(1 - p.u / 0.45)}"/>`)
  // ---- head parts
  const hr = `translate(${n1(H0[0])} ${n1(H0[1])}) rotate(${n1(p.headRot)}) scale(0.86)`
  const lookx = p.look * 8
  const sw2 = sw / 0.86
  b.push(`<g transform="${hr}">`)
  b.push(`<path d="M14 54C64 38 146 34 206 48C214 74 186 104 132 108C80 110 32 104 10 92C6 76 8 60 14 54Z" fill="${ORANGE}" stroke="${INK}" stroke-width="${sw2}" stroke-linejoin="round"/>`)
  b.push(`<path d="M26 78C80 86 144 84 192 72" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`)
  b.push(`<g transform="translate(${n1(lookx)} ${n1(p.glass)})"><path d="M-62 -22C0 -30 70 -32 150 -20C158 -10 150 22 118 36C84 48 60 30 52 6C40 12 20 12 6 8C-4 30 -28 46 -54 30C-70 16 -72 -8 -62 -22Z" fill="${INK}"/><path d="M-40 -12C-30 -16 -16 -14 -8 -10M72 -10C84 -14 100 -14 112 -10" stroke="#fff" stroke-width="4" stroke-linecap="round" fill="none" opacity="0.55"/></g>`)
  b.push(`<g transform="rotate(${n1(-6 + p.cap)})">`)
  b.push(`<path d="M-100 -26C-110 -92-60 -146 18 -146C96 -146 120 -96 110 -58C60 -70-30 -66-100 -26Z" fill="${BODY}" stroke="${INK}" stroke-width="${sw2}" stroke-linejoin="round"/>`)
  b.push(`<path d="M-100 -26C-140 -34-178 -20-196 12C-160 22-122 14-94 0Z" fill="${BODY}" stroke="${INK}" stroke-width="${sw2}" stroke-linejoin="round"/>`)
  b.push(`<path d="M-8 -118L38 -118L-8 -78L40 -78" fill="none" stroke="${INK}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>`)
  b.push('</g></g>')
  g.push(`<g transform="${bt}">${b.join('')}</g>`)
  return g.join('')
}

// ---------- cover (paper curtain) ----------
function coverState(f, tip) {
  // base hem height H(f) and the pinched peak
  // one monotone curve: the sheet starts slowly under the pull and accelerates off the top
  const Hh = f <= 102 ? 1500 : f >= 162 ? -520 : lerp(1500, -520, Math.pow((f - 102) / 60, 1.6))
  const k = f < 91 ? 0 : f < 151 ? 1 : clamp(1 - (f - 151) / 5, 0, 1)
  const pinch = f < 100 ? 0 : clamp((f - 98) / 22, 0, 1)
  return { Hh, k, pinch }
}
function cover(f, tip, seed) {
  const { Hh, k, pinch } = coverState(f, tip)
  if (Hh < -500) return { svg: '', Hh, edge: null }
  const r = rng(seed + 77)
  const pts = []
  const peak = Hh > tip[1] ? lerp(1500, tip[1], smooth(pinch)) : Hh
  const base = Math.min(Hh, 1500)
  for (let x = -300; x <= 2220; x += 40) {
    const wd = 480 + 0.34 * Math.max(0, base - tip[1])
    const u = (x - tip[0]) / wd
    const bump = Math.abs(u) < 1 ? Math.cos((Math.PI * u) / 2) ** 2 : 0
    const rip = f > 138 ? Math.sin(x * 0.012 + f * 0.5) * 7 * (f > 150 ? 1 : 0.5) : 0
    let y = base - (base - peak) * bump * (k ? 1 : 0) + rip
    if (f >= 151 && Hh > tip[1]) y = base
    pts.push([x, y + 0])
  }
  const edge = curve(pts, false)
  const shade = pts.map(([x, y]) => [x, y - 14]).reverse()
  const back = curve([...pts].reverse(), false)
  const body = `M-300 -300H2220L${n1(pts[pts.length - 1][0])} ${n1(pts[pts.length - 1][1])}${back.replace(/^M[^C]*/, '')}Z`
  const stain = (cx, cy, rx, ry, o) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#stain)" opacity="${o}"/>`
  const wr = (x1, y1, x2, y2, w = 3) => `<path d="M${x1} ${y1}L${x2} ${y2}" stroke="${INK}" stroke-width="${w}" stroke-linecap="round" opacity="0.55"/>`
  const svg = [
    `<defs><clipPath id="cp"><path d="${body}"/></clipPath><radialGradient id="stain"><stop offset="0" stop-color="#8c8574" stop-opacity="0.22"/><stop offset="1" stop-color="#8c8574" stop-opacity="0"/></radialGradient></defs>`,
    `<path d="${body}" fill="${PAPER}"/>`,
    `<g clip-path="url(#cp)">${stain(560, 360, 520, 300, 1)}${stain(1380, 460, 560, 320, 0.8)}${stain(980, 880, 640, 240, 0.5)}`
      + `${wr(18, 30, 150, 130)}${wr(18, 80, 110, 160, 2.5)}${wr(60, 22, 200, 70, 2.5)}`
      + `${wr(1902, 30, 1770, 130)}${wr(1902, 80, 1810, 160, 2.5)}${wr(1860, 22, 1720, 70, 2.5)}`
      + `${wr(16, 1050, 150, 960)}${wr(16, 1000, 100, 940, 2.5)}${wr(1904, 1050, 1770, 960)}${wr(1904, 1000, 1820, 940, 2.5)}</g>`,
    `<path d="${edge}" fill="none" stroke="${PAPER_EDGE}" stroke-width="26" stroke-linecap="round" transform="translate(0 -13)" opacity="0.7"/>`,
    `<path d="${edge}" fill="none" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>`,
  ]
  return { svg: svg.join(''), Hh, edge: pts }
}

// ---------- fx ----------
function fx(f, p, tip) {
  const o = []
  const ln = (x1, y1, x2, y2, w = 6) => `<path d="M${n1(x1)} ${n1(y1)}L${n1(x2)} ${n1(y2)}" stroke="${INK}" stroke-width="${w}" stroke-linecap="round"/>`
  const headS = bodyMat(p)([-24 + p.nx, -458 - p.neckL])
  if (f >= 1 && f <= 12) { o.push(ln(p.x - 270, GROUND - 40, p.x - 300, GROUND - 56, 5), ln(p.x + 280, GROUND - 40, p.x + 308, GROUND - 56, 5)) }
  if (f >= 31 && f <= 42) { const a = Math.min(1, (f - 30) / 3); o.push(`<g opacity="${a}">${ln(headS[0] + 130, headS[1] - 130, headS[0] + 136, headS[1] - 70, 9)}<circle cx="${n1(headS[0] + 132)}" cy="${n1(headS[1] - 40)}" r="6" fill="${INK}"/></g>`) }
  if (f >= 43 && f <= 66) { o.push(ln(tip[0] + 44, tip[1] + 60, tip[0] + 62, tip[1] + 20, 5), ln(tip[0] + 74, tip[1] + 74, tip[0] + 100, tip[1] + 44, 5), ln(tip[0] - 70, tip[1] + 100, tip[0] - 82, tip[1] + 140, 5)) }
  if (f >= 67 && f <= 90) { const a = f <= 78 ? 1 : 0.6; o.push(`<g opacity="${a}">${ln(tip[0] - 40, tip[1] - 40, tip[0] - 70, tip[1] - 72)}${ln(tip[0], tip[1] - 56, tip[0], tip[1] - 98)}${ln(tip[0] + 40, tip[1] - 40, tip[0] + 70, tip[1] - 72)}</g>`) }
  if (f >= 85 && f <= 150) {
    const a = clamp((f - 85) / 14, 0, 1) * (f > 144 ? clamp((150 - f) / 6, 0, 1) : 1)
    const ang = [-168, -148, -128, -108, -90, -72, -52, -32, -12]
    o.push(`<g opacity="${n1(a * 0.8 * 10) / 10}">` + ang.map((d, i) => { const L1 = 70 + (i % 3) * 20, L2 = L1 + 90 + ((i * 37) % 70); return `<path d="M${n1(tip[0] + L1 * Math.cos(rad(d)))} ${n1(tip[1] + L1 * Math.sin(rad(d)))}L${n1(tip[0] + L2 * Math.cos(rad(d)))} ${n1(tip[1] + L2 * Math.sin(rad(d)))}" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/>` }).join('') + '</g>')
  }
  if (f >= 73 && f <= 150) { o.push(`<path d="M${n1(tip[0] - 46)} ${n1(tip[1] + 24)}q18 -22 34 -6M${n1(tip[0] + 8)} ${n1(tip[1] + 20)}q20 -18 38 0" stroke="${INK}" stroke-width="5" stroke-linecap="round" fill="none"/>`) }
  if (f >= 91 && f <= 150 && f % 6 < 3) { o.push(ln(p.x + 210, GROUND - 120, p.x + 262, GROUND - 124), ln(p.x + 220, GROUND - 78, p.x + 282, GROUND - 74)) }
  if (f >= 103 && f <= 126) { o.push(`<path d="M${n1(headS[0] + 120)} ${n1(headS[1] - 100)}q10 18 0 30q-10-12 0-30z" fill="#7CC4F0" stroke="${INK}" stroke-width="4"/>`) }
  if (f >= 151 && f <= 162) { const a = 1 - (f - 151) / 14; o.push(`<g opacity="${n1(a * 10) / 10}">${ln(tip[0] - 20, tip[1] + 70, tip[0] - 56, tip[1] + 110)}${ln(tip[0] + 36, tip[1] + 60, tip[0] + 52, tip[1] + 112)}${ln(p.x - 280, GROUND - 60, p.x - 330, GROUND - 60)}</g>`) }
  if (f >= 163 && f <= 168) { o.push(ln(p.x - 230, GROUND - 20, p.x - 270, GROUND - 24, 5), ln(p.x + 240, GROUND - 20, p.x + 280, GROUND - 24, 5)) }
  if (f >= 171 && f <= 176) { o.push(`<path d="M${n1(p.x + 250)} ${n1(GROUND - 520)}l14 -22l14 22l-14 22z" fill="${ORANGE}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>`) }
  return o.join('')
}

// ---------- main ----------
mkdirSync(OUT, { recursive: true })
let bytes = 0
const manifest = []
for (let k = 0; k < FRAMES * SUB; k++) {
  const f = 1 + k / SUB
  const fq = f // smooth: every frame is its own pose
  const p = params(fq)
  const tip = tipScreen(p)
  const cv = cover(f, tip, fq)
  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" preserveAspectRatio="xMidYMax slice">`,
    `<title>ZaruTech duck opening, frame ${n1(f)}/${FRAMES}</title>`,
    `<g id="cover">${cv.svg}</g>`,
    `<g id="duck" stroke-linejoin="round" stroke-linecap="round">${duck(p, f, fq)}</g>`,
    `<g id="fx">${fx(f, p, tip)}</g>`,
    '</svg>',
  ].join('')
  writeFileSync(join(OUT, `frame-${String(k + 1).padStart(SUB > 1 ? 4 : 3, '0')}.svg`), svg)
  bytes += svg.length
  manifest.push({ f, hem: n1(cv.Hh), apex: cv.edge ? n1(Math.min(...cv.edge.map((q) => q[1]))) : null, tip: [n1(tip[0]), n1(tip[1])], duck: [n1(p.x), n1(GROUND - p.hop)] })
}
writeFileSync(join(OUT, 'manifest.json'), JSON.stringify({ frames: FRAMES, fps: 60 * SUB, width: W, height: H, data: manifest }))
console.log(`wrote ${FRAMES * SUB} frames, avg ${Math.round(bytes / (FRAMES * SUB))} bytes`)
