import type { Metadata } from 'next'
import { JetBrains_Mono, VT323, Press_Start_2P, Space_Grotesk } from 'next/font/google'
import './globals.css'
import { player } from '@/data/portfolio'

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

export const metadata: Metadata = {
  title: `${player.handle} - ${player.tagline}`,
  description: `${player.name} · a retro-terminal academic quest portfolio.`,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${mono.variable} ${crt.variable} ${pixel.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  )
}
