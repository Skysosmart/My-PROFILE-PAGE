'use client'

import Image from 'next/image'

/**
 * One of the duck's twelve expressions, as a small sticker: a reply from the
 * contact form, an empty state, a hint.
 */
export type EmoteName =
  | 'neutral'
  | 'tongue'
  | 'question'
  | 'sparkle'
  | 'smirk'
  | 'hearts'
  | 'angry'
  | 'crying'
  | 'sweat'
  | 'surprised'
  | 'sleepy'
  | 'matrix'

export default function Emote({
  name,
  size = 48,
  className = '',
}: {
  name: EmoteName
  /** the square the sticker sits in, in px */
  size?: number
  className?: string
}) {
  return (
    <span aria-hidden className={`relative inline-block shrink-0 ${className}`} style={{ width: `${size / 16}rem`, height: `${size / 16}rem` }}>
      <Image
        src={`/duck/emote-${name}-light.png`}
        alt=""
        fill
        sizes={`${Math.round(size * 1.4)}px`}
        draggable={false}
        className="object-contain select-none"
      />
    </span>
  )
}
