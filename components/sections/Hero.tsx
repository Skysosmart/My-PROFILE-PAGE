'use client'

import { motion } from 'framer-motion'
import GlassCard from '@/components/GlassCard'
import GlowButton from '@/components/GlowButton'
import { fadeUp, stagger, scaleIn } from '@/lib/motion'
import { ArrowDown } from 'lucide-react'

export default function Hero() {
  return (
    <section
      id="hero"
      className="min-h-screen flex items-center justify-center px-6 py-20 relative overflow-hidden"
    >
      {/* Animated background gradient */}
      <motion.div
        className="absolute inset-0 opacity-20 pointer-events-none"
        animate={{
          background: [
            'radial-gradient(circle at 20% 50%, rgba(236, 72, 153, 0.3) 0%, transparent 50%)',
            'radial-gradient(circle at 80% 50%, rgba(236, 72, 153, 0.3) 0%, transparent 50%)',
            'radial-gradient(circle at 50% 80%, rgba(236, 72, 153, 0.3) 0%, transparent 50%)',
            'radial-gradient(circle at 20% 50%, rgba(236, 72, 153, 0.3) 0%, transparent 50%)',
          ],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Floating pink particles */}
      {[...Array(20)].map((_, i) => {
        const randomX = Math.random() * 100
        const randomY = Math.random() * 100
        const randomOpacity = Math.random() * 0.5 + 0.2
        const randomDuration = Math.random() * 3 + 2
        const randomDelay = Math.random() * 2
        const randomSize = Math.random() * 3 + 1
        
        return (
          <motion.div
            key={i}
            className="absolute rounded-full bg-pink-400 pointer-events-none"
            style={{
              width: `${randomSize}px`,
              height: `${randomSize}px`,
              left: `${randomX}%`,
              top: `${randomY}%`,
            }}
            initial={{
              opacity: randomOpacity,
              x: 0,
              y: 0,
            }}
            animate={{
              x: [
                Math.random() * 100 - 50,
                Math.random() * 100 - 50,
                Math.random() * 100 - 50,
              ],
              y: [
                Math.random() * 100 - 50,
                Math.random() * 100 - 50,
                Math.random() * 100 - 50,
              ],
              opacity: [
                randomOpacity,
                randomOpacity * 0.5,
                randomOpacity,
              ],
            }}
            transition={{
              duration: randomDuration * 3,
              repeat: Infinity,
              delay: randomDelay,
              ease: 'easeInOut',
            }}
          />
        )
      })}

      <div className="max-w-7xl mx-auto w-full grid md:grid-cols-2 gap-12 items-center relative z-10">
        {/* Left: Text + CTA */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          <motion.div variants={fadeUp}>
            <motion.h1
              className="text-5xl md:text-7xl font-bold mb-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <span className="bg-gradient-to-r from-pink-400 via-pink-500 to-pink-600 bg-clip-text text-transparent">
                Hello, I'm
              </span>
            </motion.h1>
            <motion.h2
              className="text-4xl md:text-6xl font-bold text-white mb-6"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Nonthanaphong Saechua
            </motion.h2>  
          </motion.div>

          <motion.p
            variants={fadeUp}
            className="text-xl md:text-2xl text-white/70 leading-relaxed max-w-xl"
          >
            Crafting digital experiences with passion, precision, and pixel-perfect design.
            Welcome to my world of creativity and innovation.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="flex flex-col sm:flex-row gap-4"
          >
            <GlowButton
              variant="primary"
              onClick={() => {
                document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              Get In Touch
            </GlowButton>
            <GlowButton
              variant="outline"
              onClick={() => {
                document.getElementById('certificates')?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              View Work
            </GlowButton>
          </motion.div>
        </motion.div>

        {/* Right: Profile Glass Card */}
        <motion.div
          variants={scaleIn}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.3 }}
          className="relative"
        >
          <GlassCard hover glow className="p-8">
            <div className="space-y-6">
              {/* Profile Image Placeholder */}
              <motion.div
                className="w-48 h-48 mx-auto rounded-full bg-gradient-to-br from-pink-500/20 to-pink-600/20 border-2 border-pink-500/30 flex items-center justify-center"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-6xl">👤</div>
              </motion.div>
              
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold text-white">Creative Developer</h3>
                <p className="text-pink-400">Full Stack Engineer</p>
              </div>

              <div className="flex justify-center gap-4 pt-4 border-t border-white/10">
                {['React', 'Next.js', 'TypeScript'].map((tech, index) => (
                  <motion.span
                    key={tech}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="px-4 py-2 rounded-full bg-pink-500/10 text-pink-400 text-sm font-medium border border-pink-500/20"
                  >
                    {tech}
                  </motion.span>
                ))}
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-10 left-0 right-0 flex justify-center items-center z-20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.6 }}
      >
        <motion.a
          href="#about"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center text-pink-400 hover:text-pink-300 transition-colors"
        >
          <span className="text-sm mb-2">Scroll</span>
          <ArrowDown className="w-6 h-6" />
        </motion.a>
      </motion.div>
    </section>
  )
}
