'use client'

import { useSyncExternalStore } from 'react'
import Link from 'next/link'
import { about, certificates, contact, player, profile, projects } from '@/data/portfolio'
import { projectSlug, splitTitle } from '@/lib/projects'

/**
 * The homepage in plain HTML, for whoever reads it without running it.
 *
 * Every section of the homepage loads in the browser (see Portfolio's
 * `split`), so the server's HTML used to hold the title and nothing else: a
 * crawler that doesn't run JavaScript (the AI ones mostly don't) found an
 * empty page, no contact details and nothing to cite. This is the same
 * content, from the same data, rendered on the server: who, what, the
 * projects, the awards, how to reach me, with links to the pages that are
 * server-rendered in full (/projects/*, /certificates, /writeups).
 *
 * Screen-reader only, and gone once the page has hydrated, so the real
 * sections take over and nothing is read twice.
 */
const subscribe = () => () => {}

export default function PageSummary() {
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  )
  if (hydrated) return null

  const awards = certificates.filter((c) => c.featured)

  return (
    <div className="sr-only">
      <h1>{player.name}</h1>
      <p>{player.role}</p>
      <p>
        {profile.school}, {profile.location}. {profile.status}.
      </p>
      {about.paragraphs.map((p) => (
        <p key={p}>{p}</p>
      ))}

      <h2>Projects</h2>
      <ul>
        {projects.map((p) => {
          const { name } = splitTitle(p.title)
          return (
            <li key={p.title}>
              <Link href={`/projects/${projectSlug(p)}`}>{name}</Link> ({p.period}, {p.role}): {p.description}
            </li>
          )
        })}
      </ul>

      <h2>Selected certificates and awards</h2>
      <ul>
        {awards.map((c) => (
          <li key={c.file}>
            {c.title}
            {c.result ? `: ${c.result}` : ''}
          </li>
        ))}
      </ul>
      <p>
        <Link href="/certificates">All certificates</Link> · <Link href="/writeups">CTF and security writeups</Link> ·{' '}
        <a href="/resume.pdf">Resume (PDF)</a>
      </p>

      <h2>Contact</h2>
      <p>{contact.blurb}</p>
      <ul>
        {contact.channels.map((ch) => (
          <li key={ch.key}>
            {ch.key}: <a href={ch.href}>{ch.value}</a>
          </li>
        ))}
      </ul>
    </div>
  )
}
