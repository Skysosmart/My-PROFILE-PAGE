'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import GlowButton from '@/components/GlowButton'
import GlassCard from '@/components/GlassCard'
import { fadeUp, scaleIn } from '@/lib/motion'
import { Mail, MapPin, Phone, Send, Github, Linkedin, Twitter } from 'lucide-react'

const contactInfo = [
  { icon: Mail, text: 'your.email@example.com', link: 'mailto:your.email@example.com' },
  { icon: Phone, text: '+1 (234) 567-8900', link: 'tel:+12345678900' },
  { icon: MapPin, text: 'Your City, Country', link: '#' },
]

const socialLinks = [
  { icon: Github, name: 'GitHub', link: 'https://github.com', color: 'hover:text-gray-300' },
  { icon: Linkedin, name: 'LinkedIn', link: 'https://linkedin.com', color: 'hover:text-blue-400' },
  { icon: Twitter, name: 'Twitter', link: 'https://twitter.com', color: 'hover:text-sky-400' },
]

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
    setFormData({ name: '', email: '', message: '' })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <section
      id="contact"
      className="min-h-screen py-20 px-6 relative flex items-center justify-center"
    >
      <div className="max-w-4xl mx-auto w-full">
        {/* Section Header */}
        <motion.div
          className="text-center mb-12"
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
            Get In Touch
          </motion.h2>
          <motion.div
            className="w-24 h-1 bg-gradient-to-r from-transparent via-pink-500 to-transparent mx-auto mb-6"
            initial={{ width: 0 }}
            whileInView={{ width: 96 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Have a project in mind? Let's create something amazing together
          </p>
        </motion.div>

        {/* Centered Glass Panel */}
        <motion.div
          variants={scaleIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <GlassCard glow className="p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-12">
              {/* Contact Info */}
              <motion.div
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="space-y-6"
              >
                <h3 className="text-2xl font-bold text-pink-400 mb-6">Let's Connect</h3>
                
                <div className="space-y-4">
                  {contactInfo.map((info, index) => {
                    const Icon = info.icon
                    return (
                      <motion.a
                        key={info.text}
                        href={info.link}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ x: 5 }}
                        className="flex items-center gap-4 text-white/80 hover:text-pink-400 transition-colors group"
                      >
                        <div className="w-12 h-12 rounded-lg bg-pink-500/20 flex items-center justify-center group-hover:bg-pink-500/30 transition-colors border border-pink-500/20">
                          <Icon className="w-5 h-5 text-pink-400" />
                        </div>
                        <span>{info.text}</span>
                      </motion.a>
                    )
                  })}
                </div>

                {/* Social Icons */}
                <div className="pt-6 border-t border-white/10">
                  <h4 className="text-white font-semibold mb-4">Follow Me</h4>
                  <div className="flex gap-4">
                    {socialLinks.map((social, index) => {
                      const Icon = social.icon
                      return (
                        <motion.a
                          key={social.name}
                          href={social.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          initial={{ opacity: 0, scale: 0 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.2, y: -5 }}
                          whileTap={{ scale: 0.9 }}
                          className={`w-12 h-12 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white/60 ${social.color} transition-colors`}
                        >
                          <Icon className="w-5 h-5" />
                        </motion.a>
                      )
                    })}
                  </div>
                </div>
              </motion.div>

              {/* Contact Form */}
              <motion.form
                onSubmit={handleSubmit}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="space-y-6"
              >
                <div>
                  <label htmlFor="name" className="block text-white/80 mb-2 text-sm">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-black/40 backdrop-blur-xl border border-white/10 focus:border-pink-500 focus:outline-none text-white placeholder-white/40 transition-colors"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-white/80 mb-2 text-sm">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-black/40 backdrop-blur-xl border border-white/10 focus:border-pink-500 focus:outline-none text-white placeholder-white/40 transition-colors"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-white/80 mb-2 text-sm">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 rounded-lg bg-black/40 backdrop-blur-xl border border-white/10 focus:border-pink-500 focus:outline-none text-white placeholder-white/40 transition-colors resize-none"
                    placeholder="Tell me about your project..."
                  />
                </div>

                <GlowButton variant="primary" glow>
                  <span className="flex items-center gap-2">
                    <Send className="w-5 h-5" />
                    Send Message
                  </span>
                </GlowButton>
              </motion.form>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </section>
  )
}
