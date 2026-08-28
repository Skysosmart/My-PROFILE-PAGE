'use client'

import { certificates, assets } from '@/data/portfolio'

const thumb = (file: string) => assets.certDir + 'thumbs/' + encodeURIComponent(file)

/**
 * Animated background unique to the Certificates section:
 * three CONVEYOR ROWS of the real certificates, endlessly gliding in
 * alternating directions at different speeds, slightly tilted and edge-faded —
 * a living award wall behind the gallery.
 *
 * Each row's content is duplicated once and translated -50% in a loop, so the
 * marquee is seamless. Pure CSS transform animation (GPU-cheap); the global
 * prefers-reduced-motion rule freezes it. Absolute (not fixed) — scrolls away
 * with the section.
 */
const ROWS = 3

export default function CertWall() {
  // Split all certs across the rows.
  const per = Math.ceil(certificates.length / ROWS)
  const rows = Array.from({ length: ROWS }, (_, r) =>
    certificates.slice(r * per, (r + 1) * per),
  )

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      style={{
        maskImage:
          'radial-gradient(ellipse 100% 90% at 50% 45%, black 30%, transparent 85%)',
        WebkitMaskImage:
          'radial-gradient(ellipse 100% 90% at 50% 45%, black 30%, transparent 85%)',
      }}
    >
      <div className="absolute -left-[10%] top-1/2 flex w-[120%] -translate-y-1/2 -rotate-3 flex-col gap-8 opacity-[0.16] saturate-[0.8]">
        {rows.map((row, r) => (
          <div key={r} className="flex overflow-hidden">
            <div
              className="animate-marquee flex shrink-0 items-center gap-8 pr-8"
              style={{
                animationDuration: `${60 + r * 14}s`,
                animationDirection: r % 2 ? 'reverse' : 'normal',
              }}
            >
              {/* duplicated sequence -> seamless -50% loop */}
              {[...row, ...row].map((c, i) => (
                <img
                  key={i}
                  src={thumb(c.file)}
                  alt=""
                  className="h-32 w-auto shrink-0 rounded-lg shadow-2xl sm:h-36"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
