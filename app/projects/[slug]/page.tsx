import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import CaseStudy from '@/components/projects/CaseStudy'
import { player, projects } from '@/data/portfolio'
import { projectSlug, splitTitle } from '@/lib/projects'

type Params = { params: Promise<{ slug: string }> }

const find = (slug: string) => projects.find((p) => projectSlug(p) === slug)

export function generateStaticParams() {
  return projects.map((p) => ({ slug: projectSlug(p) }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const p = find((await params).slug)
  if (!p) return {}
  const { name, line } = splitTitle(p.title)
  return {
    title: `${name}${line ? ` - ${line}` : ''} · ${player.name}`,
    description: p.description,
    alternates: { canonical: `/projects/${projectSlug(p)}` },
    openGraph: {
      type: 'article',
      title: name,
      description: p.description,
      ...(p.image ? { images: [{ url: p.image }] } : {}),
    },
  }
}

export default async function ProjectPage({ params }: Params) {
  const p = find((await params).slug)
  if (!p) notFound()
  return <CaseStudy slug={projectSlug(p)} />
}
