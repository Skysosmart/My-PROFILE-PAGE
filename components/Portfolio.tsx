'use client'

import { useCallback, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import BootScreen from '@/components/BootScreen'
import Header from '@/components/Header'
import NameTag from '@/components/NameTag'

import dynamic from 'next/dynamic'
import IntroHero from '@/components/sections/IntroHero'
import Deferred from '@/components/ui/Deferred'
import Footer from '@/components/Footer'

// Each section is its own chunk, fetched when Deferred mounts it. ssr: false
// costs nothing here: nothing below the boot screen was ever server-rendered,
// because it only mounts once `started` flips on the client.
//
// `loading` must hold the section's height while the chunk is in flight. Left
// to its default (nothing), a mounting section collapsed to 0px, the next
// placeholder slid up into the viewport and mounted, and so on down the page:
// all three sections in one cascade, which is the exact spike this exists to
// prevent.
const Reserve = () => <div aria-hidden style={{ minHeight: '100svh' }} />
const split = (load: () => Promise<{ default: React.ComponentType }>) =>
  dynamic(load, { ssr: false, loading: Reserve })
const AboutMe = split(() => import('@/components/sections/AboutMe'))
const Certificates = split(() => import('@/components/sections/Certificates'))
const Projects = split(() => import('@/components/sections/Projects'))

/**
 * Top-level client wrapper.
 * A terminal loading screen auto-advances into the site: the ASCII hand stays
 * as a fixed background, the liquid-glass header floats on top, and the content
 * sections scroll normally over them, ending in the contact footer.
 *
 * Only the hero mounts with the site. The three sections below it are
 * code-split and mount one by one as the reader approaches them, so a phone
 * is never asked to build the whole page in the frame after boot.
 */
export default function Portfolio() {
  const [started, setStarted] = useState(false)
  // stable identity so BootScreen's timers are never reset by a new prop
  const start = useCallback(() => setStarted(true), [])

  return (
    <>
      {/* Loading screen (terminal text only).
          Deliberately NOT inside AnimatePresence: it held the overlay mounted
          at full opacity over an already-rendered site, so the only way past
          the boot screen was to click it. BootScreen fades itself out and then
          calls onStart, so a plain conditional is both simpler and reliable. */}
      {!started && <BootScreen onStart={start} />}

      {/* Site */}
      {started && (
        <>
          <Header />
          <NameTag />
          <motion.main
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="relative z-10"
          >
            <IntroHero />
            {/* one section at a time: see Deferred */}
            <Deferred id="about">
              <AboutMe />
            </Deferred>
            <Deferred id="certificates">
              <Certificates />
            </Deferred>
            <Deferred id="projects">
              <Projects />
            </Deferred>
            <Footer />
          </motion.main>
        </>
      )}
    </>
  )
}
