'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useReducedMotion, useScroll, useTransform, type MotionValue } from 'motion/react'
import { certSrc } from '@/lib/certs'
import { cadGeometry, cadProjects } from '@/data/cad'

/**
 * Between the certificate desk and the workbench: one sheet of paper changes
 * job.
 *
 *   document    the MakeX certificate comes forward off the desk
 *   paper       its print fades; the sheet stays
 *   turn        it turns over, blank side up
 *   sketch      construction lines, then the MakeX board holder itself,
 *               drawn line by line (its real edges, scripts/cad/build.py)
 *   drawing     dimensions and a title block: an engineering drawing
 *   hand-off    the frame lifts away and the drawing is left for the
 *               workbench, which opens on the same drawing in the same view
 *
 * It is the scroll that draws it: a sticky stage inside a tall box, every
 * layer a transform of the box's scroll progress (no state, no re-render per
 * frame, nothing that takes the scroll away from the reader). Reduced motion
 * gets the finished drawing, standing still, in a box of its own height.
 */
const SHEET = { w: 1414, h: 1000 } // A4 landscape, in sheet units
const MARGIN = 36
const BLOCK = { w: 430, h: 132 } // the title block, bottom right
const PROJECT = cadProjects[0]
const CERT = 'MakeX Ultimate winner.jpg'

type Sketch = { w: number; h: number; paths: { part: string; d: string }[] }

export default function PaperToBlueprint() {
  const reduce = !!useReducedMotion()
  const box = useRef<HTMLDivElement>(null)
  const sheetRef = useRef<HTMLDivElement>(null)
  const [sketch, setSketch] = useState<Sketch | null>(null)
  const [px, setPx] = useState(1) // screen px per sheet unit
  const { scrollYProgress: p } = useScroll({ target: box, offset: ['start start', 'end end'] })

  useEffect(() => {
    let live = true
    fetch(`/cad/${PROJECT.slug}/sketch.json`)
      .then((r) => r.json())
      .then((j: Sketch) => live && setSketch(j))
      .catch(() => {})
    return () => {
      live = false
    }
  }, [])
  useLayoutEffect(() => {
    const el = sheetRef.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => e.contentRect.width && setPx(e.contentRect.width / SHEET.w))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // the sheet: forward off the desk, then turned over, then let go
  const scale = useTransform(p, [0, 0.12, 0.86, 1], [0.84, 1, 1, 1.08])
  const lift = useTransform(p, [0, 0.12], [50, 0])
  const tilt = useTransform(p, [0, 0.12], [-2.5, 0])
  const turn = useTransform(p, [0.27, 0.42], [0, 180])
  const print = useTransform(p, [0.12, 0.25], [1, 0])
  // the drawing's furniture
  const grid = useTransform(p, [0.44, 0.58], [0, 1])
  const frame = useTransform(p, [0.44, 0.54], [0, 1])
  const construct = useTransform(p, [0.5, 0.6], [0, 1])
  const dims = useTransform(p, [0.76, 0.84], [0, 1])
  const block = useTransform(p, [0.8, 0.88], [0, 1])
  const furnitureOut = useTransform(p, [0.9, 1], [1, 0])
  const paperOut = useTransform(p, [0.92, 1], [1, 0])
  const caption = useTransform(p, [0.05, 0.12, 0.86, 0.94], [0, 1, 1, 0])

  // where the model sits in the drawing area, in sheet units
  const area = { x: MARGIN + 40, y: MARGIN + 40, w: SHEET.w - 2 * MARGIN - 80 - BLOCK.w * 0.35, h: SHEET.h - 2 * MARGIN - 80 - BLOCK.h }
  const fit = sketch ? Math.min(area.w / sketch.w, area.h / sketch.h) : 1
  const at = sketch
    ? { x: area.x + (area.w - sketch.w * fit) / 2, y: area.y + (area.h - sketch.h * fit) / 2, w: sketch.w * fit, h: sketch.h * fit }
    : null
  const size = cadGeometry[PROJECT.slug]?.size ?? [0, 0, 0]
  const pen = (screenPx: number) => screenPx / px // sheet units for a stroke of n screen px

  if (reduce) {
    return (
      // the scroll tracker still needs its element, though nothing here follows it
      <section ref={box} aria-label="From certificate to drawing" className="px-[clamp(16px,4vw,64px)] py-16">
        <div ref={sheetRef} className="relative mx-auto aspect-[1414/1000] w-full max-w-[64rem] shadow-[0_2px_4px_rgba(17,17,17,0.06),0_30px_50px_-30px_rgba(17,17,17,0.45)]">
          <Drawing sketch={sketch} at={at} fit={fit} pen={pen} size={size} still />
        </div>
      </section>
    )
  }

  return (
    <section ref={box} aria-label="From certificate to drawing" className="relative h-[190vh] md:h-[240vh]">
      <p className="sr-only">
        The MakeX certificate turns over and becomes the engineering drawing of the MakeX board holder: the first project on the workbench below.
      </p>
      <div aria-hidden className="sticky top-0 flex h-svh items-center justify-center overflow-hidden px-[clamp(16px,4vw,64px)] [perspective:1800px]">
        <motion.p
          style={{ opacity: caption }}
          className="absolute left-1/2 top-[11%] -translate-x-1/2 whitespace-nowrap font-hand text-[1.125rem] text-accent-text sm:top-[9%] sm:text-[1.375rem]"
        >
          same paper. different job.
        </motion.p>
        <motion.div
          ref={sheetRef}
          style={{ scale, y: lift, rotate: tilt }}
          className="relative aspect-[1414/1000] w-full max-w-[min(64rem,calc((100svh-9rem)*1.414))] [transform-style:preserve-3d]"
        >
          <motion.div style={{ rotateY: turn }} className="absolute inset-0 [transform-style:preserve-3d]">
            {/* front: the certificate */}
            <div className="absolute inset-0 bg-white p-[0.35%] shadow-[0_2px_4px_rgba(17,17,17,0.06),0_30px_50px_-30px_rgba(17,17,17,0.45)] [backface-visibility:hidden]">
              <motion.div style={{ opacity: print }} className="h-full w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={certSrc(CERT)} alt="" loading="lazy" decoding="async" className="block h-full w-full object-cover" />
              </motion.div>
            </div>
            {/* back: the drawing sheet */}
            <motion.div
              style={{ opacity: paperOut }}
              className="absolute inset-0 bg-[#fbf9f3] shadow-[0_2px_4px_rgba(17,17,17,0.06),0_30px_50px_-30px_rgba(17,17,17,0.45)] [backface-visibility:hidden] [transform:rotateY(180deg)]"
            />
            <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]">
              <Drawing
                sketch={sketch}
                at={at}
                fit={fit}
                pen={pen}
                size={size}
                p={p}
                grid={grid}
                frame={frame}
                construct={construct}
                dims={dims}
                block={block}
                furnitureOut={furnitureOut}
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

/* ── the drawing itself, scroll-driven or still ───────────────────────── */

// each part draws in its own stretch of the scroll, the frame first
const PART_RANGE: Record<string, [number, number]> = {
  frame: [0.55, 0.72],
  'main-board': [0.6, 0.76],
  'second-board': [0.63, 0.78],
  xt30: [0.66, 0.8],
}

function Drawing({
  sketch,
  at,
  fit,
  pen,
  size,
  still = false,
  p,
  grid,
  frame,
  construct,
  dims,
  block,
  furnitureOut,
}: {
  sketch: Sketch | null
  at: { x: number; y: number; w: number; h: number } | null
  fit: number
  pen: (n: number) => number
  size: number[]
  still?: boolean
  p?: MotionValue<number>
  grid?: MotionValue<number>
  frame?: MotionValue<number>
  construct?: MotionValue<number>
  dims?: MotionValue<number>
  block?: MotionValue<number>
  furnitureOut?: MotionValue<number>
}) {
  const one = still ? 1 : undefined
  // the still drawing has no scroll to follow: every line is simply drawn
  const done = useMotionValue(1)
  const bx = SHEET.w - MARGIN - BLOCK.w
  const by = SHEET.h - MARGIN - BLOCK.h
  const mono = { fontFamily: 'var(--font-mono), monospace' }
  return (
    <svg viewBox={`0 0 ${SHEET.w} ${SHEET.h}`} className="absolute inset-0 h-full w-full" style={still ? { background: '#fbf9f3' } : undefined}>
      <defs>
        <pattern id="p2b-grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0H0V20" fill="none" stroke="rgba(17,17,17,0.07)" strokeWidth={pen(1)} />
        </pattern>
      </defs>
      <motion.g style={{ opacity: furnitureOut ?? one }}>
        <motion.rect x={MARGIN} y={MARGIN} width={SHEET.w - 2 * MARGIN} height={SHEET.h - 2 * MARGIN} fill="url(#p2b-grid)" style={{ opacity: grid ?? one }} />
        {/* the border and the title block's rules */}
        <motion.path
          d={`M${MARGIN} ${MARGIN}H${SHEET.w - MARGIN}V${SHEET.h - MARGIN}H${MARGIN}Z M${bx} ${SHEET.h - MARGIN}V${by}H${SHEET.w - MARGIN} M${bx} ${by + 44}H${SHEET.w - MARGIN} M${bx} ${by + 88}H${SHEET.w - MARGIN} M${bx + 250} ${by + 44}V${SHEET.h - MARGIN}`}
          fill="none"
          stroke="#111"
          strokeWidth={pen(1.6)}
          style={{ pathLength: frame ?? 1 }}
        />
      </motion.g>

      {at && sketch && (
        <>
          {/* construction: the centre lines and the box the part fits in */}
          <motion.g style={{ opacity: furnitureOut ?? one }}>
            <motion.path
              d={`M${at.x - 30} ${at.y + at.h / 2}H${at.x + at.w + 30} M${at.x + at.w / 2} ${at.y - 30}V${at.y + at.h + 30}`}
              fill="none"
              stroke="rgba(17,17,17,0.45)"
              strokeWidth={pen(1)}
              strokeDasharray={`${pen(14)} ${pen(4)} ${pen(2)} ${pen(4)}`}
              style={{ opacity: construct ?? one }}
            />
            <motion.rect
              x={at.x}
              y={at.y}
              width={at.w}
              height={at.h}
              fill="none"
              stroke="rgba(17,17,17,0.28)"
              strokeWidth={pen(1)}
              style={{ pathLength: construct ?? 1 }}
            />
          </motion.g>

          {/* the part, drawn */}
          <g transform={`translate(${at.x} ${at.y}) scale(${fit})`}>
            {sketch.paths.map((s) => (
              <PartPath key={s.part} d={s.d} width={pen(1.25) / fit} p={p ?? done} range={still ? [0, 1] : (PART_RANGE[s.part] ?? [0.6, 0.8])} />
            ))}
          </g>

          {/* dimensions: the overall height and width */}
          <motion.g style={{ opacity: dims ?? one }} stroke="#111" strokeWidth={pen(1)} fill="none">
            <path d={`M${at.x - 54} ${at.y}V${at.y + at.h} M${at.x - 62} ${at.y}H${at.x - 46} M${at.x - 62} ${at.y + at.h}H${at.x - 46}`} />
            <path d={`M${at.x} ${at.y + at.h + 50}H${at.x + at.w} M${at.x} ${at.y + at.h + 42}V${at.y + at.h + 58} M${at.x + at.w} ${at.y + at.h + 42}V${at.y + at.h + 58}`} />
            <text x={at.x - 66} y={at.y + at.h / 2} fill="#111" stroke="none" fontSize={22} textAnchor="middle" transform={`rotate(-90 ${at.x - 66} ${at.y + at.h / 2})`} style={mono}>
              {Math.round(size[1])}
            </text>
            <text x={at.x + at.w / 2} y={at.y + at.h + 80} fill="#111" stroke="none" fontSize={22} textAnchor="middle" style={mono}>
              {Math.round(size[0])} × {Math.round(size[2])}
            </text>
          </motion.g>
        </>
      )}

      {/* the title block */}
      <motion.g style={{ opacity: block ?? one }} fill="#111">
        <motion.g style={{ opacity: furnitureOut ?? one }}>
          <text x={bx + 16} y={by + 30} fontSize={22} fontWeight={700} style={mono}>
            {PROJECT.name.toUpperCase()}
          </text>
          <text x={bx + 16} y={by + 74} fontSize={15} style={mono}>
            {PROJECT.tool} · {PROJECT.year}
          </text>
          <text x={bx + 266} y={by + 74} fontSize={15} style={mono}>
            UNITS mm
          </text>
          <text x={bx + 16} y={by + 118} fontSize={15} style={mono}>
            DRAWN  SKY · ZARUTECH
          </text>
          <text x={bx + 266} y={by + 118} fontSize={15} style={mono}>
            SHEET 01/{String(cadProjects.length).padStart(2, '0')}
          </text>
        </motion.g>
      </motion.g>
    </svg>
  )
}

function PartPath({ d, width, p, range }: { d: string; width: number; p: MotionValue<number>; range: [number, number] }) {
  const drawn = useTransform(p, range, [0, 1])
  return (
    <motion.path
      d={d}
      fill="none"
      stroke="#111"
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ pathLength: drawn }}
    />
  )
}
