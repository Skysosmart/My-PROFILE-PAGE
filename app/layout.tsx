import type { Metadata } from 'next'
import { JetBrains_Mono, VT323, Press_Start_2P, Space_Grotesk, Noto_Sans_Thai_Looped } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'
import { assets, contact, player, projects } from '@/data/portfolio'
import { certStats } from '@/lib/certs'
import { SITE } from '@/lib/site'
import { LANG_BOOT } from '@/lib/lang'
import { VIEWPORT_BOOT } from '@/lib/viewport'

// Body / UI monospace
const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-jetbrains',
  display: 'swap',
})
// Big CRT terminal display font
const crt = VT323({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-vt323',
  display: 'swap',
})
// Pixel HUD accents (labels, buttons)
const pixel = Press_Start_2P({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-press-start',
  display: 'swap',
})
// Modern sans for the gallery card system (breaks out of the terminal theme)
const sans = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-grotesk',
  display: 'swap',
})

// Thai glyphs for the TH toggle: none of the faces above carry them, so this
// sits at the end of every stack and the browser falls through to it per glyph
const thai = Noto_Sans_Thai_Looped({
  subsets: ['thai'],
  weight: ['400', '700'],
  variable: '--font-thai',
  display: 'swap',
})

// counted, not typed, so it cannot go stale as the data grows
const DESCRIPTION = `${player.name} - ${player.role}. Academic portfolio: ${certStats.total} certificates including ${certStats.gold} gold medals and ${certStats.national} national-level awards, and ${projects.length} projects from a Parkinson's screening device to production web platforms.`

const channel = (key: string) => contact.channels.find((c) => c.key === key)?.href

// What a search engine is told about the person, machine-readably. The email
// is left out on purpose: it is on the page for people, and a JSON-LD field
// is the first place an address harvester looks.
const PERSON = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: player.name,
  alternateName: player.handle,
  url: SITE,
  image: `${SITE}${assets.portrait}`,
  jobTitle: 'Student',
  description: DESCRIPTION,
  knowsAbout: player.roles,
  sameAs: [channel('GITHUB'), channel('IG')].filter(Boolean),
  affiliation: {
    '@type': 'EducationalOrganization',
    name: contact.channels.find((c) => c.key === 'SCHOOL')?.value,
    url: channel('SCHOOL'),
  },
}

// Everything past the boot screen renders on the client, so a link preview
// or a crawler sees none of it: this block is the whole first impression.
export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: `${player.handle} - ${player.tagline}`,
  description: DESCRIPTION,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: SITE,
    siteName: player.handle,
    title: `${player.name} - ${player.tagline}`,
    description: DESCRIPTION,
    images: [{ url: '/og.png', width: 1200, height: 630, alt: `${player.name} - ${player.tagline}` }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${player.name} - ${player.tagline}`,
    description: DESCRIPTION,
    images: ['/og.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: the boot script below stamps data-lang on the
    // server-rendered <html> before React hydrates it, on purpose
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${mono.variable} ${crt.variable} ${pixel.variable} ${sans.variable} ${thai.variable}`}
    >
      <body>
        {/* runs before first paint: stamps <html lang> for the language */}
        <script dangerouslySetInnerHTML={{ __html: LANG_BOOT }} />
        {/* and for tablets: pins the viewport to a desktop width, so an iPad
            gets the computer's layout (see lib/viewport.ts) */}
        <script dangerouslySetInnerHTML={{ __html: VIEWPORT_BOOT }} />
        {/* '<' escaped so no string in the data could ever close this tag */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(PERSON).replace(/</g, '\\u003c') }}
        />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
