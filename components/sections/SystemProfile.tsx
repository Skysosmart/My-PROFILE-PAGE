'use client'

import GlassSection from '@/components/ui/GlassSection'
import SpecLabel from '@/components/SpecLabel'
import QuickStart from '@/components/QuickStart'
import { ui } from '@/data/ui'
import { useLang } from '@/lib/use-lang'

/**
 * 00 · SYSTEM_PROFILE - the label on the back of the device (SpecLabel):
 * model, revision, type, core, input, output, the rating strip, origin,
 * status, a barcode of the handle and a QR to the CV. Beside it the leaflet
 * from the box (QuickStart): how to play the page, one line per thing it
 * does. The About terminal below still prints who Sky is (`whoami`).
 */
export default function SystemProfile() {
  const lang = useLang()
  const t = ui[lang].profile

  return (
    <GlassSection
      id="profile"
      index="00"
      title="System Profile"
      label={`00 · ${t.label}`}
      watermark="ABOUT"
      variant="rise"
      revealAmount="some"
      panel={false}
    >
      <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-start lg:gap-12 xl:gap-16">
        <SpecLabel />
        {/* the leaflet arrives once the label has printed */}
        <QuickStart delay={1.1} />
      </div>
    </GlassSection>
  )
}
