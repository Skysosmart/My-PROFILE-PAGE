'use client'

import GlassSection from '@/components/ui/GlassSection'
import { Mark } from '@/components/ui/Mark'
import { ui } from '@/data/ui'
import { useContent } from '@/lib/use-content'
import { useLang } from '@/lib/use-lang'

/**
 * 01 · SYSTEM_PROFILE - the spec-card grid phattaradit.dev opens with, in
 * this site's terms: where, what status, which roles, which stack, and the
 * MBTI with its character. The two About paragraphs sit under it with their
 * key terms marked; the terminal, the torus and the portrait follow in the
 * About section itself, untouched.
 */
export default function SystemProfile() {
  const lang = useLang()
  const t = ui[lang].profile
  const { profile, player, about } = useContent()

  const card = 'flex flex-col gap-2 rounded-xl border border-fg/12 bg-panel/66 p-4 shadow-[inset_0_1px_0_rgb(var(--fg)/0.16)]'
  const k = 'font-mono text-[10px] uppercase tracking-[0.3em] text-fg-dim'

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
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className={card}>
          <span className={k}>{t.location}</span>
          <span className="font-sans text-base font-bold text-fg">{profile.location}</span>
          <span className="font-mono text-[11px] text-fg-muted">{profile.school}</span>
        </div>
        <div className={card}>
          <span className={k}>{t.status}</span>
          <span className="flex items-center gap-2 font-sans text-base font-bold text-fg">
            <span aria-hidden className="h-2 w-2 rounded-full bg-duck shadow-[0_0_10px_rgb(245_190_91)]" />
            {profile.status}
          </span>
          <span className="font-mono text-[11px] text-fg-muted">{player.role}</span>
        </div>
        <div className={card}>
          <span className={k}>{t.roles}</span>
          <span className="font-sans text-[13px] leading-relaxed text-fg">
            {player.roles.map((r) => (
              <span key={r} className="block">
                {r}
              </span>
            ))}
          </span>
        </div>
        <div className={`${card} sm:col-span-2`}>
          <span className={k}>{t.mbti}</span>
          <span className="flex items-baseline gap-3">
            <span className="font-crt text-4xl leading-none text-duck">{profile.mbti.type}</span>
            <span className="font-sans text-base font-bold text-fg">{profile.mbti.name}</span>
          </span>
          <span className="font-sans text-[13px] leading-relaxed text-fg/80">{profile.mbti.description}</span>
        </div>
        <div className={card}>
          <span className={k}>{t.stack}</span>
          <ul className="flex flex-wrap gap-1.5">
            {profile.stack.map((s) => (
              <li key={s} className="rounded-sm border border-fg/18 px-2 py-0.5 font-mono text-[11px] text-fg/75">
                {s}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-7 max-w-3xl space-y-4 font-sans text-[15px] leading-relaxed text-fg/85">
        {about.paragraphs.map((p, i) => (
          <p key={i}>{marked(p)}</p>
        ))}
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
