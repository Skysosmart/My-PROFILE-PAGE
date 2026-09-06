import { codes } from '@/data/codes'

/**
 * The handle as a Code 128 symbol. zint drew the bars (scripts/codes.mjs);
 * this only lays them out, with a 10-module quiet zone on each side so it
 * scans off the screen. Stretches to its box: a scanner reads the ratios.
 */
const QUIET = 10
const H = 40

export default function Barcode({ className = '' }: { className?: string }) {
  const { modules, bars } = codes.barcode
  const w = modules + QUIET * 2
  return (
    <svg
      viewBox={`0 0 ${w} ${H}`}
      preserveAspectRatio="none"
      role="img"
      aria-label={`Code 128 barcode: ${codes.handle}`}
      shapeRendering="geometricPrecision"
      className={className}
    >
      {bars.map(([x, bw], i) => (
        <rect key={i} x={x + QUIET} y={0} width={bw} height={H} fill="currentColor" />
      ))}
    </svg>
  )
}
