/**
 * A speech bubble drawn the way the duck's is: one wobbling ink outline
 * around a paper fill, with the tail part of the same line rather than a
 * rotated square stuck underneath.
 *
 * The shape is one path, stretched to whatever the text needs
 * (`preserveAspectRatio="none"`). `vector-effect="non-scaling-stroke"` is
 * what makes that survive: without it the outline would thin and thicken
 * with the box and stop reading as a pen. The Thai line is about a third
 * wider than the English one, so the tail widens a little with it - the
 * alternative is measuring the text in JS to size a fixed-aspect frame,
 * which is a lot of machinery for a difference nobody sees.
 *
 * The lettering stays the site's sans. The duck's "Hello!" is drawn by
 * hand, but Sky says his line in two languages and Thai needs a real face.
 */
export default function InkBubble({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <span className={`relative inline-block ${className}`}>
      <svg
        aria-hidden
        viewBox="0 0 200 76"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        <path
          d="M100 5C152 5 191 12 193 30c2 18-35 28-83 29c-4 5-7 11-10 17c-3-6-6-12-10-17C42 58 5 48 7 30C9 12 48 5 100 5Z"
          fill="rgb(var(--bg))"
          stroke="currentColor"
          strokeWidth={3}
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      {/* pb leaves room for the tail the path draws below the body */}
      <span className="relative block px-5 pb-6 pt-2.5">{children}</span>
    </span>
  )
}
