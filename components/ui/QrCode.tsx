import { codes } from '@/data/codes'

/**
 * The résumé's address as a QR code. qrencode drew it (scripts/codes.mjs);
 * this is one path of its dark modules on a paper square with the
 * 4-module quiet zone the symbol needs, black on cream in both themes so a
 * phone reads it either way.
 */
const QUIET = 4
const SIZE = codes.qr.length + QUIET * 2
const PATH = codes.qr
  .map((row, y) => {
    let d = ''
    for (let x = 0; x < row.length; x++) if (row[x] === '#') d += `M${x + QUIET} ${y + QUIET}h1v1h-1z`
    return d
  })
  .join('')

export default function QrCode({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      role="img"
      aria-label={`QR code: ${codes.url}`}
      shapeRendering="crispEdges"
      className={className}
    >
      <rect width={SIZE} height={SIZE} fill="#f3f0e8" />
      <path d={PATH} fill="#111" />
    </svg>
  )
}
