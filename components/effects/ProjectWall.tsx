'use client'

/**
 * Background unique to the Projects section: conveyor rows of browser-window
 * wireframes, tilted and edge-faded behind the grid.
 *
 * Same idiom as CertWall - three marquee rows, each sequence duplicated so the
 * -50% loop is seamless, pure CSS transform so the global prefers-reduced-motion
 * rule freezes it. Deliberately NOT the project screenshots: there are only
 * eight and they are already the cards in front of this, so a photo wall would
 * just show the same images twice on one screen. Empty frames say "websites"
 * without competing with the real ones.
 *
 * The layout is a fixed table rather than random, or the server and the client
 * would draw different walls and hydration would complain.
 */

// [width, height, content bars]
const FRAMES: [number, number, number][] = [
  [230, 150, 3],
  [170, 120, 2],
  [280, 175, 4],
  [200, 135, 3],
  [150, 110, 2],
  [255, 160, 3],
  [190, 125, 2],
  [300, 185, 4],
]

const ROWS = 3
const per = Math.ceil(FRAMES.length / ROWS)

export default function ProjectWall() {
  const rows = Array.from({ length: ROWS }, (_, r) => FRAMES.slice(r * per, (r + 1) * per))

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      style={{
        maskImage: 'radial-gradient(ellipse 100% 90% at 50% 45%, black 25%, transparent 82%)',
        WebkitMaskImage: 'radial-gradient(ellipse 100% 90% at 50% 45%, black 25%, transparent 82%)',
      }}
    >
      <div className="absolute -left-[10%] top-1/2 flex w-[120%] -translate-y-1/2 -rotate-3 flex-col gap-10 opacity-[0.5]">
        {rows.map((row, r) => (
          <div key={r} className="flex overflow-hidden">
            <div
              className="animate-marquee flex shrink-0 items-center gap-10 pr-10"
              style={{
                animationDuration: `${72 + r * 16}s`,
                animationDirection: r % 2 ? 'reverse' : 'normal',
              }}
            >
              {[...row, ...row, ...row].map(([w, h, bars], i) => (
                <div
                  key={i}
                  style={{ width: w, height: h }}
                  className="shrink-0 overflow-hidden rounded-lg border border-white/[0.16] bg-white/[0.015]"
                >
                  {/* chrome: traffic lights + an address bar */}
                  <div className="flex items-center gap-1 border-b border-white/[0.12] px-2.5 py-2">
                    <span className="h-1 w-1 rounded-full bg-white/25" />
                    <span className="h-1 w-1 rounded-full bg-white/25" />
                    <span className="h-1 w-1 rounded-full bg-white/25" />
                    <span className="ml-2 h-1.5 flex-1 rounded-full bg-white/[0.07]" />
                  </div>
                  {/* a hero block, then a few lines of copy */}
                  <div className="space-y-2 p-3">
                    <div className="h-1/4 min-h-[16px] w-full rounded bg-white/[0.06]" />
                    {Array.from({ length: bars }, (_, b) => (
                      <div
                        key={b}
                        className="h-1 rounded bg-white/[0.08]"
                        style={{ width: `${88 - b * 17}%` }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
