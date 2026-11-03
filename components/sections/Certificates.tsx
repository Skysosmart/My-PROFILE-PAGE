'use client'

import { useState } from 'react'
import Link from 'next/link'
import GlassSection from '@/components/ui/GlassSection'
import CertDesk from '@/components/certdesk/CertDesk'
import CertLightbox from '@/components/ui/CertLightbox'
import { certStats } from '@/lib/certs'
import { certificates, type Certificate } from '@/data/portfolio'

/**
 * CERTIFICATES - the desk.
 *
 * The featured certificates as sheets of paper put down on a desk
 * (components/certdesk): the duck brings them in, and any one can be picked
 * up and read with notes written round it. The rest of the pile - every
 * certificate - is a page of its own, /certificates.
 *
 * The four with a rank come first, so they land in the middle row.
 */
const desk = [...certificates.filter((c) => c.featured)].sort((a, b) => (b.medal ? 1 : 0) - (a.medal ? 1 : 0))

export default function Certificates() {
  const [scan, setScan] = useState<Certificate | null>(null)

  return (
    <GlassSection
      id="certificates"
      index="04"
      title="Certificates"
      command="ls certificates/"
      subtitle="The ones off the desk. Pick one up."
      watermark="CERTS"
      // "rise" only offsets y by a fixed 44px: safe for a tall section
      variant="rise"
      panel={false}
      revealAmount="some"
    >
      <CertDesk certs={desk} onScan={setScan} />

      <div className="mt-8 flex justify-center md:mt-4">
        <Link
          href="/certificates"
          className="group inline-flex items-baseline gap-3 font-mono text-[0.8125rem] uppercase tracking-[0.04em] text-fg underline-offset-4 hover:underline focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-fg th:tracking-normal"
        >
          The rest of the pile
          <span className="text-fg-dim">
            {certStats.total} in the archive
          </span>
          <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
            →
          </span>
        </Link>
      </div>

      <CertLightbox cert={scan} onClose={() => setScan(null)} />
    </GlassSection>
  )
}
