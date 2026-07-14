'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import BootScreen from '@/components/BootScreen'
import Header from '@/components/Header'
import RoleTicker from '@/components/RoleTicker'
import NameTag from '@/components/NameTag'

import IntroHero from '@/components/sections/IntroHero'
import AboutMe from '@/components/sections/AboutMe'
import Certificates from '@/components/sections/Certificates'
import Projects from '@/components/sections/Projects'
import Footer from '@/components/Footer'

/**
 * Top-level client wrapper.
 * A terminal loading screen auto-advances into the site: the ASCII hand stays
 * as a fixed background, the liquid-glass header floats on top, and the content
 * sections scroll normally over them, ending in the contact footer.
 */
export default function Portfolio() {
  const [started, setStarted] = useState(false)

  return (
    <>
      {/* Loading screen (terminal text only) */}
      <AnimatePresence>
        {!started && <BootScreen key="boot" onStart={() => setStarted(true)} />}
      </AnimatePresence>

      {/* Site */}
      {started && (
        <>
          <Header />
          <NameTag />
          <RoleTicker />
          <motion.main
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="relative z-10"
          >
            <IntroHero />
            <AboutMe />
            <Certificates />
            <Projects />
            <Footer />
          </motion.main>
        </>
      )}
    </>
  )
}
