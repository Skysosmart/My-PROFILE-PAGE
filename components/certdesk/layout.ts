import sizes from '@/data/cert-sizes.generated.json'

/**
 * Where each sheet lies on the desk, as a share of the desk's width (x) and
 * height (y), with its turn in degrees. Hand-placed rather than random: the
 * desk should look put down by a person, not shuffled by a machine, and the
 * same visitor should find the same desk twice.
 *
 * Three loose rows. The middle row is where the eye lands, so the four
 * results with a rank sit there (see `order` in CertDesk).
 */
export const SLOTS: { x: number; y: number; r: number }[] = [
  // the middle row
  { x: 0.27, y: 0.5, r: 1.5 },
  { x: 0.5, y: 0.47, r: -1.5 },
  { x: 0.73, y: 0.52, r: 0.8 },
  { x: 0.08, y: 0.54, r: -1 },
  // the top row
  { x: 0.15, y: 0.2, r: -2 },
  { x: 0.38, y: 0.17, r: 1 },
  { x: 0.62, y: 0.21, r: -0.5 },
  { x: 0.86, y: 0.18, r: 2 },
  // the bottom row
  { x: 0.17, y: 0.83, r: 0.5 },
  { x: 0.41, y: 0.81, r: -2 },
  { x: 0.64, y: 0.84, r: 1 },
  { x: 0.9, y: 0.79, r: -0.8 },
]

/** the sheet the duck hides behind once the stack is down (bottom right) */
export const PEEK_SLOT = 11

const SIZE = sizes as unknown as Record<string, [number, number]>

/** width / height of a certificate's scan; A4 landscape when unknown */
export function aspectOf(file: string) {
  const s = SIZE[file]
  return s ? s[0] / s[1] : 1.414
}

export type Box = { w: number; h: number }

/**
 * A sheet's size on the desk. Landscape sheets take a share of the desk's
 * width; portrait ones are drawn to the same paper area, so an upright
 * certificate is not twice as heavy as the rest.
 */
export function sheetSize(file: string, desk: Box, share: number): Box {
  const a = aspectOf(file)
  const w0 = desk.w * share
  const area = w0 * (w0 / 1.414)
  const w = a >= 1 ? w0 : Math.sqrt(area * a)
  return { w, h: w / a }
}

/**
 * The picked-up sheet: centred on the desk, as large as leaves room for
 * the notes written around it - a column either side and a line above and
 * below.
 */
export function focusSize(file: string, desk: Box): Box {
  const a = aspectOf(file)
  const maxW = desk.w * 0.42
  const maxH = desk.h * 0.6
  let w = maxW
  let h = w / a
  if (h > maxH) {
    h = maxH
    w = h * a
  }
  return { w, h }
}
