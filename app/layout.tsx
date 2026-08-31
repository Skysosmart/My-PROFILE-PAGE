import type { Metadata } from 'next'
import { JetBrains_Mono, VT323, Press_Start_2P, Space_Grotesk } from 'next/font/google'
import './globals.css'
import { player } from '@/data/portfolio'
import { THEME_BOOT } from '@/lib/theme'

// Body / UI monospace
const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-mono',
  display: 'swap',
})
// Big CRT terminal display font
const crt = VT323({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-crt',
  display: 'swap',
})
// Pixel HUD accents (labels, buttons)
const pixel = Press_Start_2P({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-pixel',
  display: 'swap',
})
// Modern sans for the gallery card system (breaks out of the terminal theme)
const sans = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
})

const SITE = 'https://nonthanaphong.vercel.app'
const DESCRIPTION = `${player.name} - ${player.role}. Academic portfolio: 56 certificates including two gold medals and 25 national-level awards, and nine projects from a Parkinson's screening device to production web platforms.`

// Everything past the boot screen renders on the client, so a link preview
// or a crawler sees none of it: this block is the whole first impression.
export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: `${player.handle} - ${player.tagline}`,
  description: DESCRIPTION,
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
    // suppressHydrationWarning: the boot script below stamps data-theme on the
    // server-rendered <html> before React hydrates it, on purpose
    <html
      lang="en"
      suppressHydrationWarning
      className={`${mono.variable} ${crt.variable} ${pixel.variable} ${sans.variable}`}
    >
      <body>
        {/* runs before first paint, so a returning light-theme visitor never
            sees a dark flash; reads the saved choice, else the OS setting */}
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
        {children}
      </body>
    </html>
  )
}
