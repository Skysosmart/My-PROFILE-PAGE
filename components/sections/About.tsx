'use client'

import { motion } from 'framer-motion'
import GlassCard from '@/components/GlassCard'
import { fadeUp, containerVariants, stagger, scaleIn } from '@/lib/motion'
import { Code, Palette, Rocket, Sparkles } from 'lucide-react'

const skills = [
  { icon: Code, title: 'Development', description: 'Building scalable web applications', color: 'from-blue-500/20 to-cyan-500/20' },
  { icon: Palette, title: 'Design', description: 'Creating beautiful user interfaces', color: 'from-pink-500/20 to-rose-500/20' },
  { icon: Rocket, title: 'Innovation', description: 'Pushing boundaries with new ideas', color: 'from-purple-500/20 to-pink-500/20' },
  { icon: Sparkles, title: 'Excellence', description: 'Delivering premium experiences', color: 'from-yellow-500/20 to-orange-500/20' },
]

export default function About() {
  return (
    <section
      id="about"
      className="min-h-screen py-20 px-6 relative"
    >
      <div className="max-w-7xl mx-auto">
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
            variants={scaleIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            About Me
          </motion.h2>
          <motion.div
            className="w-24 h-1 bg-gradient-to-r from-transparent via-pink-500 to-transparent mx-auto mb-6"
            initial={{ width: 0 }}
            whileInView={{ width: 96 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            A passionate creative developer dedicated to crafting exceptional digital experiences
          </p>
        </motion.div>

        {/* Two Column Layout */}
        <div className="grid md:grid-cols-2 gap-12 items-start mb-20">
          {/* Left Column: Story */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
          >
            <GlassCard glow>
              <h3 className="text-3xl font-bold mb-6 text-pink-400">My Story</h3>
              <div className="space-y-4 text-white/80 leading-relaxed">
                <p>
                  I'm a dedicated professional with a passion for creating beautiful,
                  functional, and innovative digital solutions. My journey in web development
                  has been driven by curiosity and a commitment to excellence.
                </p>
                <p>
                  With expertise in modern technologies and a keen eye for design, I bring
                  together the best of both worlds to deliver experiences that not only
                  look stunning but perform flawlessly.
                </p>
                <p>
                  Every project is an opportunity to push boundaries, learn something new,
                  and create something meaningful that resonates with users.
                </p>
              </div>
            </GlassCard>
          </motion.div>

          {/* Right Column: Highlight Cards */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="grid grid-cols-2 gap-6"
          >
            {skills.map((skill, index) => {
              const Icon = skill.icon
              return (
                <motion.div
                  key={skill.title}
                  variants={fadeUp}
                  whileHover={{ y: -5, scale: 1.02 }}
                >
                  <GlassCard hover glow className="h-full">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${skill.color} flex items-center justify-center mb-4 border border-white/10`}>
                      <Icon className="w-6 h-6 text-pink-400" />
                    </div>
                    <h4 className="text-xl font-semibold mb-2 text-white">{skill.title}</h4>
                    <p className="text-white/60 text-sm leading-relaxed">{skill.description}</p>
                  </GlassCard>
                </motion.div>
              )
            })}
          </motion.div>
        </div>

        {/* Stats Row */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {[
            { number: '50+', label: 'Projects Completed' },
            { number: '5+', label: 'Years Experience' },
            { number: '100%', label: 'Client Satisfaction' },
            { number: '24/7', label: 'Dedication' },
          ].map((stat) => (
            <motion.div key={stat.label} variants={fadeUp}>
              <GlassCard hover className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-pink-400 to-pink-600 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-white/60 text-sm">{stat.label}</div>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
