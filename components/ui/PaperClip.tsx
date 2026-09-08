/**
 * A paperclip, drawn in the same pen as <InkBubble/>: one wandering ink line,
 * round caps and joins, `currentColor`, `non-scaling-stroke` so the weight
 * survives the site's 100%-to-140% root font-size ramp instead of thinning
 * and thickening with its box.
 *
 * It comes in two halves and they are meant to be rendered on either side of
 * the sheet - `<PaperClip side="back"/>` under the paper, `side="front"` over
 * it, both at the same coordinates. That is the whole trick: a clip drawn in
 * one piece on top of a note reads as a sticker of a clip, because nothing
 * passes behind the paper. Split it and the eye reads a real fastener with
 * the sheet threaded through it.
 *
 * The geometry is one clip: an outer bend that goes over the top edge and
 * down the front, and an inner return that comes back up inside it. `back`
 * draws the stretch that dives behind the paper, `front` the two runs that
 * stay in front of it, and the small overlap where they meet is deliberate -
 * a hairline gap at the paper's edge would read as two separate marks.
 *
 * The two arms are deliberately unequal: the inner return stops a little
 * short and leans a touch off parallel. Symmetrical wobble reads as a badly
 * built icon; this reads as wire that has been bent.
 */
export default function PaperClip({
  side,
  className = '',
}: {
  side: 'front' | 'back'
  className?: string
}) {
  return (
    <svg
      aria-hidden
      // 1:2, not the 1:2.3 the first cut had. Drawn longer than that a clip
      // stops reading as bent wire and starts reading as a hairpin.
      viewBox="0 0 24 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`h-auto w-5 ${className}`}
    >
      {side === 'back' ? (
        /* the stretch behind the sheet: over the top lip and down the far
           side, which is the only part of the wire the paper hides */
        <path d="M6.4 17.6C6.1 11.5 6.6 7 9.4 4.6C12.6 1.9 17.4 2.9 18.4 6.5C19.1 9.1 18.9 13 18.6 18.3" vectorEffect="non-scaling-stroke" />
      ) : (
        <>
          {/* the outer run, down the front and round the foot */}
          <path
            d="M18.6 18.3C18.4 25.9 18.2 32.9 17.6 37C17.1 40.8 13.2 42.3 10.4 40.5C8.3 39 7.9 35.7 8.1 30.7C8.3 26.1 8.6 21.6 8.9 17"
            vectorEffect="non-scaling-stroke"
          />
          {/* the inner return, stopping short of the bend it came from */}
          <path
            d="M12.9 10.8C13.2 17.5 13.4 24.5 13.5 29.9C13.5 32.4 13.4 33.9 13.1 35"
            vectorEffect="non-scaling-stroke"
          />
        </>
      )}
    </svg>
  )
}
