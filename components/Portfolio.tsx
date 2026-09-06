'use client'

import { useCallback, useEffect, useState } from 'react'
import { motion } from 'motion/react'

import BootScreen from '@/components/BootScreen'
import Header from '@/components/Header'
import NameTag from '@/components/NameTag'

import dynamic from 'next/dynamic'
import IntroHero from '@/components/sections/IntroHero'
import Deferred from '@/components/ui/Deferred'
import Footer from '@/components/Footer'
import WriteupsTeaser from '@/components/sections/WriteupsTeaser'
import Cursor from '@/components/effects/Cursor'
import type { WriteupMeta } from '@/lib/writeups'

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
const split = <P extends object>(load: () => Promise<{ default: React.ComponentType<P> }>) =>
  dynamic(load, { ssr: false, loading: Reserve })
const SystemProfile = split(() => import('@/components/sections/SystemProfile'))
const AboutMe = split(() => import('@/components/sections/AboutMe'))
const Education = split(() => import('@/components/sections/Education'))
const Skills = split(() => import('@/components/sections/Skills'))
const Personal = split(() => import('@/components/sections/Personal'))
const Ending = split(() => import('@/components/sections/Ending'))
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
export default function Portfolio({
  writeups = [],
  formEnabled = false,
}: {
  /** the newest posts, read on the server; the teaser shows them */
  writeups?: WriteupMeta[]
  /** whether the server has a mail key, so the footer can show the form */
  formEnabled?: boolean
}) {
  // 'unknown' until the client has looked at sessionStorage: a visitor who
  // already sat through the boot this session lands on the site directly,
  // and ?boot=1 replays it on purpose
  const [phase, setPhase] = useState<'unknown' | 'boot' | 'site'>('unknown')
  useEffect(() => {
    let seen = false
    try {
      seen = sessionStorage.getItem('booted') === '1' && !new URLSearchParams(location.search).has('boot')
    } catch {}
    setPhase(seen ? 'site' : 'boot')
  }, [])
  // stable identity so BootScreen's timers are never reset by a new prop
  const start = useCallback(() => {
    try {
      sessionStorage.setItem('booted', '1')
    } catch {}
    setPhase('site')
  }, [])
  const started = phase === 'site'

  return (
    <>
      {/* Loading screen (terminal text only).
          Deliberately NOT inside AnimatePresence: it held the overlay mounted
          at full opacity over an already-rendered site, so the only way past
          the boot screen was to click it. BootScreen fades itself out and then
          calls onStart, so a plain conditional is both simpler and reliable. */}
      {phase === 'boot' && <BootScreen onStart={start} />}

      {/* Site */}
      {started && (
        <>
          <Cursor />
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
            <Deferred id="profile" minHeight="60svh">
              <SystemProfile />
            </Deferred>
            <Deferred id="about">
              <AboutMe />
            </Deferred>
            <Deferred id="education" minHeight="70svh">
              <Education />
            </Deferred>
            <Deferred id="skills" minHeight="70svh">
              <Skills />
            </Deferred>
            <Deferred id="certificates">
              <Certificates />
            </Deferred>
            <Deferred id="projects">
              <Projects />
            </Deferred>
            <WriteupsTeaser items={writeups} />
            <Deferred id="personal" minHeight="70svh">
              <Personal />
            </Deferred>
            <Deferred id="contact" minHeight="70svh">
              <Ending formEnabled={formEnabled} />
            </Deferred>
            <Footer />
          </motion.main>
        </>
      )}
    </>
  )
}
