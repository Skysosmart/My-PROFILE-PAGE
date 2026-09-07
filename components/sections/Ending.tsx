'use client'

import Duck from '@/components/duck/Duck'
import ContactForm from '@/components/ContactForm'
import { contact } from '@/data/portfolio'
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
  const socials = contact.channels.filter((c) => !['EMAIL', 'RESUME'].includes(c.key))

  return (
    <section ref={ref} id="contact" className="relative isolate scroll-mt-28 overflow-x-clip px-4 py-16 sm:px-6 sm:py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute right-2 top-0 -z-10 select-none font-crt text-[10rem] leading-none text-fg/[0.04] sm:right-6 sm:text-[18.75rem]"
      >
        END
      </div>
      <div className="mx-auto grid w-full max-w-5xl gap-10 lg:grid-cols-[auto_1fr] lg:gap-16">
        <div className="flex justify-center lg:justify-start">
          <Duck pose="thumbs" width={150} parallax={8} className="lg:!w-[15rem]" />
        </div>

        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <span className="font-mono text-[0.6875rem] uppercase tracking-[0.35em] text-fg-dim">[ 08 · {t.label} ]</span>
            <h2 className="font-crt text-5xl leading-[0.95] text-fg txt-glow sm:text-6xl">{t.title1}</h2>
            <p className="font-crt text-3xl leading-none text-duck sm:text-4xl">{t.title2}</p>
          </div>

          <dl className="grid gap-6 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <dt className="font-mono text-[0.625rem] uppercase tracking-[0.3em] text-fg-dim">{t.mail}</dt>
              <dd className="m-0">
                <a href={email?.href} className="font-sans text-[0.9375rem] font-bold text-fg underline-offset-4 hover:underline">
                  {email?.value}
                </a>
              </dd>
            </div>
            <div className="flex flex-col gap-1.5">
              <dt className="font-mono text-[0.625rem] uppercase tracking-[0.3em] text-fg-dim">{t.meet}</dt>
              <dd className="m-0 font-sans text-[0.9375rem] font-bold text-fg">{profile.location}</dd>
            </div>
            <div className="flex flex-col gap-1.5">
              <dt className="font-mono text-[0.625rem] uppercase tracking-[0.3em] text-fg-dim">{t.find}</dt>
              <dd className="m-0 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[0.75rem]">
                {socials.map((c) => (
                  <a
                    key={c.key}
                    href={c.href}
                    target="_blank"
                    rel="noreferrer"
                    title={c.value}
                    className="text-fg-muted underline-offset-4 transition-colors hover:text-fg hover:underline"
                  >
                    {c.key}
                  </a>
                ))}
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
                className="inline-flex min-h-[2.5rem] w-fit items-center gap-2 rounded-full bg-fg px-5 font-mono text-[0.6875rem] uppercase tracking-[0.15em] text-bg transition-opacity hover:opacity-90"
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
                className="inline-flex min-h-[2.5rem] w-fit items-center gap-2 rounded-full border border-fg/30 px-5 font-mono text-[0.6875rem] uppercase tracking-[0.15em] text-fg transition-colors hover:border-fg/70"
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
