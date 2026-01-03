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
                  Since childhood, I wasn't a top student or particularly outstanding. My grades 
                  were consistently at the bottom of the class almost every year. That changed 
                  when I first touched a computer, and the game that sparked my interest in 
                  technology was Roblox. That was the turning point that transformed me from 
                  an insecure child into someone genuinely passionate about the digital world. 
                  Roblox made me feel like I could "create something" for the first time in my life.
                </p>
                <p>
                  From there, I began experimenting with coding, playing with plugins, and gradually 
                  exploring backend systems. I started to see how vast the world of technology is 
                  and how much more there is to learn. I've tried many fields—Game Development, 
                  Robotics, and even Electronics—but ultimately felt they weren't my true passion. 
                  That is, until I discovered the world of Cyber Security and CTF.
                </p>
                <p>
                  That was the pivotal moment for me. It was the first time I felt "This is what 
                  I want to wake up and do every day." Solving challenges, analyzing systems, 
                  thinking systematically, and the feeling of successfully exploiting vulnerabilities 
                  was something I'd never experienced in other fields. It made me realize I wanted 
                  to pursue this seriously, not just as a hobby.
                </p>
                <p>
                  During high school, I had opportunities to compete in various competitions and was 
                  honored to become an ACT Brand Ambassador as a Content Creator. This role helped 
                  me develop my communication and presentation skills significantly. I believe a good 
                  engineer isn't just "technically skilled" but must also "be able to explain things 
                  so others can understand." This role boosted my confidence in leadership, 
                  communication, and teamwork.
                </p>
                <p>
                  I've also worked on many projects, from Web Development, Full Stack, APIs, and 
                  Automation, including experimenting with simple tools for system penetration and 
                  vulnerability testing in a student-appropriate way. I love the feeling of solving 
                  difficult problems and I'm passionate about endless self-learning, especially in 
                  Cybersecurity where everything is constantly evolving.
                </p>
                <p>
                  The key reason I chose ICE—Information & Communication Engineering (ISE Chulalongkorn)—
                  is because I want a strong engineering foundation in Network, Computer Systems, 
                  Algorithms, Software, Infrastructure, and Security. These are essential if I want 
                  to advance in Cyber Security, Digital Forensics, Penetration Testing, or even become 
                  a Security Researcher in the future.
                </p>
                <p>
                  I didn't grow from intelligence or talent, but from persistence, genuine interest, 
                  and constantly finding ways to learn on my own. I believe ICE will be an environment 
                  that pushes me to grow both in engineering and in creating digital innovations, 
                  enabling me to achieve my goal of becoming a Cyber Security engineer with the 
                  capabilities to benefit society in the future.
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
