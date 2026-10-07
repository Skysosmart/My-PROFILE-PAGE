'use client'

import Duck from '@/components/duck/Duck'
import ContactForm from '@/components/ContactForm'
import SectionHeading from '@/components/ui/SectionHeading'
import { contact, education } from '@/data/portfolio'
import { socialIcons } from '@/data/tech-icons'
import { ui } from '@/data/ui'
import { useContent } from '@/lib/use-content'
import { useLang } from '@/lib/use-lang'
import { useTint } from '@/lib/tint'

/**
 * 06 · CONTACT - the page's ending, the way cartooneast.in ends: a headline
 * that says so, the duck, and every way to reach Sky. Carries id="contact"
 * so the header's CONTACT entry scrolls here. With a mail key on the server
 * the form sits under the channels; without one the mailto link is the form.
 */
export default function Ending({ formEnabled = false }: { formEnabled?: boolean }) {
  const lang = useLang()
  const ref = useTint('contact')
  const t = ui[lang].ending
  const { profile } = useContent()
  const email = contact.channels.find((c) => c.key === 'EMAIL')
  const resume = contact.channels.find((c) => c.key === 'RESUME')
  // the current school's crest stands in for its link
  const schoolLogo = education.find((ch) => ch.to === undefined)?.logo
  const socials = contact.channels.filter((c) => !['EMAIL', 'RESUME'].includes(c.key))

  return (
    <section ref={ref} id="contact" className="relative isolate scroll-mt-28 overflow-x-clip px-[clamp(16px,4vw,64px)] py-16 sm:py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute right-2 top-0 -z-10 select-none font-crt text-[10rem] leading-none text-fg/[0.04] sm:right-6 sm:text-[18.75rem]"
      >
        END
      </div>
      <div className="mx-auto grid w-full max-w-[92.5rem] gap-10 lg:grid-cols-[auto_1fr] lg:items-center lg:gap-20">
        {/* the desk has cleared: the duck waves goodbye */}
        <div className="order-last flex justify-center lg:order-none lg:justify-start">
          <Duck pose="wave" width={170} parallax={8} className="lg:!w-[18rem]" />
        </div>

        <div className="flex flex-col gap-8">
          <SectionHeading index="08" label={t.label} command="ping sky" subtitle={`${t.title1} ${t.title2}`} className="!mb-0" />

          <dl className="grid gap-6 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <dt className="font-mono text-[0.75rem] uppercase tracking-[0.3em] text-fg-dim">{t.mail}</dt>
              <dd className="m-0">
                <a href={email?.href} className="font-sans text-base font-bold text-fg underline-offset-4 hover:underline sm:text-lg">
                  {email?.value}
                </a>
              </dd>
            </div>
            <div className="flex flex-col gap-1.5">
              <dt className="font-mono text-[0.75rem] uppercase tracking-[0.3em] text-fg-dim">{t.meet}</dt>
              <dd className="m-0 font-sans text-base font-bold text-fg sm:text-lg">{profile.location}</dd>
            </div>
            <div className="flex flex-col gap-1.5">
              <dt className="font-mono text-[0.75rem] uppercase tracking-[0.3em] text-fg-dim">{t.find}</dt>
              <dd className="m-0 mt-1 flex flex-wrap gap-3">
                {socials.map((c) => {
                  const icon = socialIcons[c.key]
                  return (
                    <a
                      key={c.key}
                      href={c.href}
                      target="_blank"
                      rel="noreferrer"
                      title={`${c.key} · ${c.value}`}
                      aria-label={`${c.key}: ${c.value}`}
                      className="grid h-11 w-11 place-items-center rounded-[6px] border border-[#111]/45 bg-white shadow-[3px_3px_0_#111] transition-[translate,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#111]"
                    >
                      {icon ? (
                        <svg aria-hidden viewBox="0 0 24 24" className="h-6 w-6" style={{ fill: icon.hex }}>
                          <path d={icon.path} />
                        </svg>
                      ) : c.key === 'SCHOOL' && schoolLogo ? (
                        // the school's own crest
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={schoolLogo} alt="" className="h-7 w-7 object-contain" />
                      ) : (
                        <span className="font-mono text-[0.625rem] font-bold">{c.key}</span>
                      )}
                    </a>
                  )
                })}
              </dd>
            </div>
          </dl>

          <div className="flex flex-col gap-4">
            {formEnabled ? (
              <ContactForm />
            ) : (
              <a
                href={email?.href}
                data-cursor-label="mail"
                className="inline-flex min-h-[2.75rem] w-fit items-center gap-2 rounded-[3px] bg-[#111] px-5 font-mono text-[0.8125rem] uppercase tracking-[0.15em] text-bg transition-opacity hover:opacity-90"
              >
                {t.mail} →
              </a>
            )}
            {resume && (
              // a plain anchor, not Link: next/link prefetches its target as
              // an RSC payload, and a route handler that returns a PDF 500s
              <a
                href={resume.href}
                target="_blank"
                rel="noreferrer"
                data-cursor-label="pdf ↗"
                className="inline-flex min-h-[2.75rem] w-fit items-center gap-2 rounded-[3px] border border-fg/30 px-5 font-mono text-[0.8125rem] uppercase tracking-[0.15em] text-fg transition-colors hover:border-fg/70"
              >
                <svg aria-hidden width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 4v11" />
                  <path d="m7 10 5 5 5-5" />
                  <path d="M5 20h14" />
                </svg>
                {t.resume}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
