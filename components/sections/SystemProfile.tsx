'use client'

import { motion, useReducedMotion } from 'motion/react'
import GlassSection from '@/components/ui/GlassSection'
import SpecLabel from '@/components/SpecLabel'
import { Mark } from '@/components/ui/Mark'
import { ui } from '@/data/ui'
import { useContent } from '@/lib/use-content'
import { useLang } from '@/lib/use-lang'

/**
 * 00 · SYSTEM_PROFILE - the label on the back of the device (SpecLabel):
 * model, revision, type, core, input, output, the rating strip, origin,
 * status, a barcode of the handle and a QR to the CV. Beside it, under
 * READ BEFORE USE, the two About paragraphs with their key terms marked.
 * The terminal, the torus and the portrait follow in the About section
 * itself, untouched.
 */
export default function SystemProfile() {
  const lang = useLang()
  const t = ui[lang].profile
  const { about } = useContent()
  const reduce = useReducedMotion()

  // mark the glossary terms wherever they appear in the paragraphs
  const marked = (text: string) => {
    const terms = lang === 'th' ? TH_TERMS : EN_TERMS
    const re = new RegExp(`(${terms.map((x) => x.match.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'g')
    return text.split(re).map((part, i) => {
      const hit = terms.find((x) => x.match === part)
      return hit ? (
        <Mark key={i} term={hit.term}>
          {part}
        </Mark>
      ) : (
        <span key={i}>{part}</span>
      )
    })
  }

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
        {/* the paragraphs arrive once the label has printed */}
        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ delay: reduce ? 0 : 1.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="lg:pt-2"
        >
          <span className="mb-4 block font-mono text-[0.625rem] uppercase tracking-[0.35em] text-fg-dim">{t.readBeforeUse}</span>
          <div className="space-y-4 font-sans text-[0.9375rem] leading-relaxed text-fg/85">
            {about.paragraphs.map((p, i) => (
              <p key={i}>{marked(p)}</p>
            ))}
          </div>
        </motion.div>
      </div>
    </GlassSection>
  )
}

// the glossary key, and how the term is spelled in each language's paragraphs
const EN_TERMS = [
  { term: 'web apps', match: 'web apps' },
  { term: 'CTF', match: 'CTF' },
  { term: 'pentesting', match: 'penetration tester' },
  { term: '3D', match: '3D' },
]
const TH_TERMS = [
  { term: 'web apps', match: 'เว็บแอป' },
  { term: 'CTF', match: 'CTF' },
  { term: 'pentesting', match: 'เพนเทสเตอร์' },
  { term: '3D', match: '3D' },
]
