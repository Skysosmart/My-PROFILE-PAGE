import type { Project } from '@/data/portfolio'

/** "Name - the line" -> { name, line } (the line may be empty) */
export const splitTitle = (title: string) => {
  const i = title.indexOf(' - ')
  return i < 0 ? { name: title, line: '' } : { name: title.slice(0, i), line: title.slice(i + 3) }
}

/** the URL-safe name, from the English title so it is the same in both languages */
export const slugify = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

export const projectSlug = (p: Pick<Project, 'title'>) => slugify(splitTitle(p.title).name)

/** the description's first sentence, when it has a short one (Thai mostly does not mark them) */
export const lead = (text: string) => {
  const m = /^(.{20,190}?[.!?])\s/.exec(text)
  return m ? m[1] : ''
}
