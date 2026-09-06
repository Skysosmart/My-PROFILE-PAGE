import fs from 'node:fs/promises'
import path from 'node:path'
import matter from 'gray-matter'

/**
 * Writeups: CTF solutions and security notes, one MDX file each under
 * content/writeups/. The file name is the slug. Files starting with `_` are
 * templates and never publish. `draft: true` publishes only outside
 * production, so a post can be previewed on a Vercel preview URL first.
 *
 * Server only: this reads the disk. Pages import it; components get metas.
 */

export const CATEGORIES = ['web', 'network', 'crypto', 'forensics', 'pwn', 'rev', 'osint', 'misc', 'notes'] as const
export type Category = (typeof CATEGORIES)[number]
export type Difficulty = 'easy' | 'medium' | 'hard' | 'insane'

export type WriteupMeta = {
  slug: string
  title: string
  /** ISO date, YYYY-MM-DD */
  date: string
  /** the CTF or course, if any */
  event?: string
  category: Category
  tags: string[]
  difficulty?: Difficulty
  /** one or two sentences for lists and link previews */
  summary: string
  draft: boolean
  /** words / 200, rounded up */
  minutes: number
}

const DIR = path.join(process.cwd(), 'content', 'writeups')

/** Drafts show everywhere except the production deployment. */
export const showDrafts =
  process.env.VERCEL_ENV != null
    ? process.env.VERCEL_ENV !== 'production'
    : process.env.NODE_ENV !== 'production'

const isCategory = (v: unknown): v is Category => CATEGORIES.includes(v as Category)

function toMeta(slug: string, data: Record<string, unknown>, body: string): WriteupMeta {
  const words = body.split(/\s+/).filter(Boolean).length
  return {
    slug,
    title: String(data.title ?? slug),
    date: String(data.date ?? '1970-01-01').slice(0, 10),
    event: data.event ? String(data.event) : undefined,
    category: isCategory(data.category) ? data.category : 'misc',
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    difficulty: data.difficulty as Difficulty | undefined,
    summary: String(data.summary ?? ''),
    draft: data.draft === true,
    minutes: Math.max(1, Math.ceil(words / 200)),
  }
}

async function readAll(): Promise<{ meta: WriteupMeta; content: string }[]> {
  let files: string[]
  try {
    files = await fs.readdir(DIR)
  } catch {
    return []
  }
  const posts = await Promise.all(
    files
      .filter((f) => f.endsWith('.mdx') && !f.startsWith('_'))
      .map(async (f) => {
        const raw = await fs.readFile(path.join(DIR, f), 'utf8')
        const { data, content } = matter(raw)
        return { meta: toMeta(f.replace(/\.mdx$/, ''), data, content), content }
      }),
  )
  return posts
    .filter((p) => showDrafts || !p.meta.draft)
    .sort((a, b) => (a.meta.date < b.meta.date ? 1 : -1))
}

/** Every publishable writeup, newest first. */
export async function getWriteups(): Promise<WriteupMeta[]> {
  return (await readAll()).map((p) => p.meta)
}

/** One writeup with its MDX source, or null. */
export async function getWriteup(slug: string) {
  return (await readAll()).find((p) => p.meta.slug === slug) ?? null
}
