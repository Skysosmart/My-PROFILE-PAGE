'use client'

import GlassSection from '@/components/ui/GlassSection'
import EducationJourney from '@/components/education/EducationJourney'
import { EducationHighlights, EducationSummary } from '@/components/education/EducationExtras'
import { certificates } from '@/data/portfolio'
import { ui } from '@/data/ui'
import { certYear } from '@/lib/certs'
import { useContent } from '@/lib/use-content'
import { useLang } from '@/lib/use-lang'

/**
 * 02 · EDUCATION - `$ cat education/`. Not a list of schools: the places and
 * moments that changed direction, flown by a paper plane.
 *
 *   EducationJourney     the line, the stops, the records, the plane and its trail
 *   EducationSummary     the current chapter as a taped spec sheet (desktop: beside, sticky)
 *   EducationHighlights  real moments from these years as desk prints, and one duck
 *
 * Everything is read off data/portfolio.ts `education` (oldest first, the
 * current one is the chapter with no `to`), the certificates dated inside
 * each chapter, and the moments' own photographs. Nothing is filled in where
 * the data is silent.
 */
export default function Education() {
  const lang = useLang()
  const t = ui[lang].education
  const { education, profile, moments } = useContent()
  const counts = education.map((ch) =>
    certificates.filter((c) => {
      const y = Number(certYear(c))
      return y >= ch.from && (ch.to === undefined || y <= ch.to)
    }).length,
  )
  const current = [...education].reverse().find((ch) => ch.to === undefined)

  return (
    <GlassSection
      id="education"
      index="02"
      title={t.label}
      command="cat education/"
      subtitle={t.intro}
      watermark="EDU"
      variant="rise"
      revealAmount="some"
      panel={false}
    >
      <div className="grid gap-12 xl:grid-cols-[minmax(0,1fr)_17rem] xl:gap-10">
        <EducationJourney chapters={education} counts={counts} t={t} />
        {current && (
          <aside className="max-w-[20rem] xl:sticky xl:top-32 xl:mt-2 xl:self-start">
            <EducationSummary ch={current} location={profile.location} t={t} />
          </aside>
        )}
      </div>
      <EducationHighlights moments={moments} t={t} />
    </GlassSection>
  )
}
