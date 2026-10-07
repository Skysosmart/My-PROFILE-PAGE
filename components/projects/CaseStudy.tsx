'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Fragment } from 'react'
import WriteupChrome from '@/components/writeups/WriteupChrome'
import Barcode from '@/components/ui/Barcode'
import { ui } from '@/data/ui'
import { lead, projectSlug, splitTitle } from '@/lib/projects'
import { useContent } from '@/lib/use-content'
import { useLang } from '@/lib/use-lang'

/**
 * A project's case file, on its own page: what the workbench shows in a
 * column, given the room to be read. Everything here is the project's own
 * data (data/portfolio.ts, its Thai copy in portfolio.th.ts): the recording
 * or the screenshot, the description, the build log when there is one, the
 * outcome, and the spec. A field the project does not have is left out.
 *
 * It wears the projects section's accent (blue) through `[id=projects]`.
 */
export default function CaseStudy({ slug }: { slug: string }) {
  const lang = useLang()
  const t = ui[lang].projects
  const { projects } = useContent()
  const i = projects.findIndex((x) => projectSlug(x) === slug)
  const p = projects[i]
  if (!p) return null
  const { name, line } = splitTitle(p.title)
  const first = lead(p.description)
  const rest = (first && p.description.slice(first.length).trim()) || ''
  const prev = projects[(i - 1 + projects.length) % projects.length]
  const next = projects[(i + 1) % projects.length]

  const spec: [string, string][] = (
    [
      [t.type, p.category],
      [t.role, p.role],
      [t.builtWith, p.tags.join(' · ')],
      [t.status, t.statuses[p.status]],
      [t.year, p.period],
      [t.credit, p.contribution],
    ] as [string, string | undefined][]
  ).filter((r): r is [string, string] => Boolean(r[1]))

  return (
    <main id="projects" className="mx-auto flex min-h-screen w-full max-w-[1200px] flex-col px-4 pb-20 pt-5 sm:px-6">
      <WriteupChrome path={`projects/${slug}`} />

      <header className="mt-12 sm:mt-16">
        <p className="mb-4 font-mono text-sm uppercase tracking-[0.3em] text-fg th:tracking-normal">
          <span className="mr-2 rounded-[3px] bg-accent px-1.5 py-0.5 text-xs font-bold leading-none tracking-normal text-[#111]">
            {String(i + 1).padStart(2, '0')}
          </span>
          {p.category ?? 'Project'}
        </p>
        <h1 className="font-mono text-[2.25rem] font-bold leading-[1.1] text-fg sm:text-[3.25rem]">{name}</h1>
        {line && <p className="mt-2 font-sans text-lg font-semibold text-fg sm:text-xl">{line}</p>}
        <span aria-hidden className="mt-5 block h-0.5 w-24 bg-accent-text" />
      </header>

      {/* the window: the recording, or the screenshot */}
      {(p.video || p.image) && (
        <figure className="m-0 mt-10 overflow-hidden rounded-[12px] border border-[#111] bg-white shadow-[6px_6px_0_#111]">
          <div className="flex items-center gap-2 border-b border-[#111]/15 px-3.5 py-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57] opacity-75" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e] opacity-75" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840] opacity-75" />
            <span className="ml-3 truncate font-mono text-[0.875rem] text-fg">~/projects/{slug}</span>
          </div>
          {p.video ? (
            <video
              src={p.video}
              poster={p.image}
              controls
              muted
              playsInline
              preload="metadata"
              aria-label={`${name} - screen recording`}
              className="block aspect-video w-full bg-[#111] object-contain"
            />
          ) : (
            <Image src={p.image!} alt={`${name} screenshot`} width={1600} height={1000} sizes="(min-width: 1200px) 1150px, 95vw" className="block h-auto w-full" priority />
          )}
        </figure>
      )}

      <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-14">
        <article className="min-w-0">
          <section>
            <h2 className="font-mono text-[0.9375rem] text-fg">
              <span className="text-accent-text">$</span> cat overview.md
            </h2>
            {first && <p className="mt-4 max-w-[65ch] font-sans text-xl font-semibold leading-snug text-fg th:leading-[1.6]">{first}</p>}
            <p className="mt-3 max-w-[65ch] font-sans text-base leading-relaxed text-fg/90 th:leading-[1.8]">{rest || (first ? '' : p.description)}</p>
          </section>

          {p.buildLog && (
            <section className="mt-10">
              <h2 className="font-mono text-[0.9375rem] text-fg">
                <span className="text-accent-text">$</span> cat build.log
              </h2>
              <pre className="mt-4 whitespace-pre-wrap font-mono text-[0.875rem] leading-relaxed text-fg">{p.buildLog}</pre>
            </section>
          )}

          <section className="mt-10">
            <h2 className="font-mono text-[0.9375rem] text-fg">
              <span className="text-accent-text">$</span> cat outcome.txt
            </h2>
            <dl className="mt-4 grid gap-2 font-mono text-[0.875rem]">
              <div className="flex gap-3">
                <dt className="w-24 shrink-0 uppercase tracking-[0.15em] text-fg-dim th:tracking-normal">{t.status}</dt>
                <dd className="m-0 text-fg">{t.statuses[p.status]}</dd>
              </div>
              {p.contribution && (
                <div className="flex gap-3">
                  <dt className="w-24 shrink-0 uppercase tracking-[0.15em] text-fg-dim th:tracking-normal">{t.credit}</dt>
                  <dd className="m-0 text-fg">{p.contribution}</dd>
                </div>
              )}
            </dl>
          </section>

          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
            {p.demo && (
              <a
                href={p.demo}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-3 rounded-[3px] bg-[#111] px-5 py-3 font-mono text-[0.875rem] uppercase tracking-[0.12em] text-[rgb(var(--bg))] transition-opacity hover:opacity-90 th:tracking-normal"
              >
                <span aria-hidden>→</span> {t.viewLive} ↗
              </a>
            )}
            {p.repo && (
              <a
                href={p.repo}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-[0.8125rem] uppercase tracking-[0.2em] text-fg-muted underline-offset-4 hover:text-fg hover:underline th:tracking-normal"
              >
                {t.source} ↗
              </a>
            )}
          </div>
        </article>

        {/* the build spec: a taped print */}
        <aside className="relative self-start lg:rotate-[1.5deg]">
          <span aria-hidden className="absolute -top-3 left-1/2 z-10 h-5 w-20 -translate-x-1/2 -rotate-2 bg-[#e3d6b8]/85" />
          <div className="rounded-[3px] border border-[#111]/45 bg-white px-5 pb-4 pt-6 font-mono text-[0.8125rem] uppercase text-[#111] shadow-[6px_6px_0_#111]">
            <p className="border-b border-dashed border-[#111]/50 pb-2 text-base font-bold tracking-[0.05em]">{t.spec}</p>
            <dl className="m-0 grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 py-3">
              {spec.map(([k, v]) => (
                <Fragment key={k}>
                  <dt className="text-[#111]/60">{k}</dt>
                  <dd className="m-0 break-words font-semibold normal-case">{v}</dd>
                </Fragment>
              ))}
            </dl>
            <div className="flex items-end justify-between gap-3 border-t border-dashed border-[#111]/40 pt-3">
              <span className="font-bold tracking-[0.2em]">ZARUTECH</span>
              <Barcode className="block h-7 w-24" />
            </div>
          </div>
        </aside>
      </div>

      {/* the way back, and along the shelf */}
      <nav aria-label="projects" className="mt-16 grid gap-3 border-t border-fg/15 pt-6 font-mono text-[0.8125rem] sm:grid-cols-3">
        <Link href={`/projects/${projectSlug(prev)}`} className="text-fg-muted transition-colors hover:text-fg">
          ← {t.prev}: <span className="text-fg">{splitTitle(prev.title).name}</span>
        </Link>
        <Link href="/#projects" className="text-fg-muted transition-colors hover:text-fg sm:text-center">
          $ cd ~/projects <span className="text-fg-dim">({t.caseBack})</span>
        </Link>
        <Link href={`/projects/${projectSlug(next)}`} className="text-fg-muted transition-colors hover:text-fg sm:text-right">
          {t.next}: <span className="text-fg">{splitTitle(next.title).name}</span> →
        </Link>
      </nav>
    </main>
  )
}
