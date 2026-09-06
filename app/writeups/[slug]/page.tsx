import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { compileMDX } from 'next-mdx-remote/rsc'
import rehypePrettyCode, { type Options as PrettyCodeOptions } from 'rehype-pretty-code'
import WriteupChrome from '@/components/writeups/WriteupChrome'
import { player } from '@/data/portfolio'
import { getWriteup, getWriteups } from '@/lib/writeups'

type Params = { params: Promise<{ slug: string }> }

// Both themes are emitted as CSS variables on every token; globals.css picks
// one by [data-theme], so the code recolours with the rest of the site.
const prettyCode: PrettyCodeOptions = {
  theme: { light: 'github-light-default', dark: 'github-dark-default' },
  keepBackground: false,
}

export async function generateStaticParams() {
  return (await getWriteups()).map((w) => ({ slug: w.slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const post = await getWriteup(slug)
  if (!post) return {}
  const { meta } = post
  return {
    title: `${meta.title} - ${player.name}`,
    description: meta.summary,
    alternates: { canonical: `/writeups/${meta.slug}` },
    openGraph: {
      type: 'article',
      title: meta.title,
      description: meta.summary,
      publishedTime: meta.date,
      tags: meta.tags,
    },
  }
}

export default async function WriteupPage({ params }: Params) {
  const { slug } = await params
  const post = await getWriteup(slug)
  if (!post) notFound()
  const { meta, content } = post

  const { content: body } = await compileMDX({
    source: content,
    options: { mdxOptions: { rehypePlugins: [[rehypePrettyCode, prettyCode]] } },
  })

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col px-4 pb-16 pt-5 sm:px-6">
      <WriteupChrome path={`writeups/${meta.slug}`} />
      <article className="mt-10">
        <header className="flex flex-col gap-3">
          <span className="font-mono text-[0.625rem] uppercase tracking-[0.25em] text-fg-dim">
            {[meta.event, meta.date, meta.category, meta.difficulty].filter(Boolean).join(' · ')}
            {meta.draft && ' · draft'}
          </span>
          <h1 className="font-sans text-3xl font-bold leading-tight text-fg sm:text-4xl">{meta.title}</h1>
          {meta.summary && <p className="font-sans text-[0.9375rem] text-fg-muted">{meta.summary}</p>}
          {meta.tags.length > 0 && (
            <ul className="flex flex-wrap gap-1.5">
              {meta.tags.map((t) => (
                <li key={t} className="rounded-sm border border-fg/20 px-2 py-0.5 font-mono text-[0.625rem] text-fg/75">
                  {t}
                </li>
              ))}
            </ul>
          )}
          <div className="ascii-rule mt-2 opacity-60" />
        </header>
        <div className="writeup-prose mt-8">{body}</div>
      </article>
      <div className="mt-auto pt-16">
        <div className="ascii-rule opacity-40" />
        <p className="mt-3 font-mono text-[0.6875rem] text-fg-dim">
          {meta.minutes} min · {player.name}
        </p>
      </div>
    </main>
  )
}
