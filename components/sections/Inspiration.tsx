'use client'

import { motion } from 'framer-motion'
import GlassCard from '@/components/GlassCard'
import { fadeUp, stagger, containerVariants } from '@/lib/motion'
import { Lightbulb, Heart, Target, Zap } from 'lucide-react'

const inspirations = [
  {
    icon: Lightbulb,
    title: 'Innovation First',
    description: 'I believe in pushing boundaries and exploring new possibilities. Every project is an opportunity to innovate and create something unique that stands out.',
    gradient: 'from-yellow-500/20 via-orange-500/20 to-pink-500/20',
    iconColor: 'text-yellow-400',
  },
  {
    icon: Heart,
    title: 'Passion Driven',
    description: 'My work is fueled by genuine passion for creating beautiful, meaningful experiences. When you love what you do, excellence follows naturally.',
    gradient: 'from-pink-500/20 via-rose-500/20 to-red-500/20',
    iconColor: 'text-pink-400',
  },
  {
    icon: Target,
    title: 'Purposeful Design',
    description: 'Every element, every animation, every interaction serves a purpose. Good design is not just beautiful—it\'s intuitive, accessible, and impactful.',
    gradient: 'from-blue-500/20 via-cyan-500/20 to-teal-500/20',
    iconColor: 'text-blue-400',
  },
  {
    icon: Zap,
    title: 'Continuous Growth',
    description: 'The tech world evolves rapidly, and so do I. Learning is a lifelong journey, and I embrace every opportunity to expand my skills and knowledge.',
    gradient: 'from-purple-500/20 via-pink-500/20 to-orange-500/20',
    iconColor: 'text-purple-400',
  },
]

export default function Inspiration() {
  return (
    <section
      id="inspiration"
      className="min-h-screen py-20 px-6 relative overflow-hidden"
    >
      {/* Background Elements */}
      <motion.div
        className="absolute inset-0 opacity-10 pointer-events-none"
        animate={{
          background: [
            'radial-gradient(circle at 0% 0%, rgba(236, 72, 153, 0.4) 0%, transparent 50%)',
            'radial-gradient(circle at 100% 100%, rgba(236, 72, 153, 0.4) 0%, transparent 50%)',
            'radial-gradient(circle at 0% 0%, rgba(236, 72, 153, 0.4) 0%, transparent 50%)',
          ],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center mb-20"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          <motion.h2
            className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-pink-400 to-pink-600 bg-clip-text text-transparent"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            My Inspiration
          </motion.h2>
          <motion.div
            className="w-24 h-1 bg-gradient-to-r from-transparent via-pink-500 to-transparent mx-auto mb-6"
            initial={{ width: 0 }}
            whileInView={{ width: 96 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            The values and principles that guide my creative journey
          </p>
        </motion.div>

        {/* Cinematic Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid md:grid-cols-2 gap-8 mb-20"
        >
          {inspirations.map((inspiration, index) => {
            const Icon = inspiration.icon
            return (
              <motion.div
                key={inspiration.title}
                variants={fadeUp}
                whileHover={{ y: -10, scale: 1.02 }}
              >
                <GlassCard hover glow className="h-full relative overflow-hidden">
                  {/* Gradient Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${inspiration.gradient} opacity-50`} />
                  
                  <div className="relative z-10">
                    <motion.div
                      className={`w-16 h-16 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center mb-6`}
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                    >
                      <Icon className={`w-8 h-8 ${inspiration.iconColor}`} />
                    </motion.div>
                    
                    <h3 className="text-2xl font-bold mb-4 text-white">{inspiration.title}</h3>
                    <p className="text-white/70 leading-relaxed">{inspiration.description}</p>
                  </div>
                </GlassCard>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Quote Section */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center"
        >
          <GlassCard className="max-w-3xl mx-auto" glow>
            <motion.blockquote
              className="text-3xl md:text-4xl font-light italic text-white/90 mb-4"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
            >
              "The best way to predict the future is to create it."
            </motion.blockquote>
            <motion.p
              className="text-pink-400 text-lg"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.3 }}
            >
              — Peter Drucker
            </motion.p>
          </GlassCard>
        </motion.div>
      </div>
    </section>
  )
}
