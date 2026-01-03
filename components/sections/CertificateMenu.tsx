'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import Image from 'next/image'
import GlassCard from '@/components/GlassCard'
import { fadeUp, stagger, scaleIn } from '@/lib/motion'
import { Award, ExternalLink, X } from 'lucide-react'
import certificatesData from '@/data/certificates.json'

interface Certificate {
  id: number
  title: string
  issuer: string
  date: string
  category: string
  description: string
  image: string | null
  link: string | null
}

const certificates: Certificate[] = certificatesData as Certificate[]

const categories = ['All', 'Development', 'Design', 'Creative', 'Business', 'Robotics']

export default function CertificateMenu() {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null)

  const filteredCertificates =
    selectedCategory === 'All'
      ? certificates
      : certificates.filter((cert) => cert.category === selectedCategory)

  return (
    <section
      id="certificates"
      className="min-h-screen py-20 px-6 relative"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
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
            Certificates & Achievements
          </motion.h2>
          <motion.div
            className="w-24 h-1 bg-gradient-to-r from-transparent via-pink-500 to-transparent mx-auto mb-6"
            initial={{ width: 0 }}
            whileInView={{ width: 96 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            A collection of certifications and achievements that showcase continuous learning
          </p>
        </motion.div>

        {/* Category Filter Tabs */}
        <motion.div
          className="flex flex-wrap justify-center gap-4 mb-12"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {categories.map((category) => (
            <motion.button
              key={category}
              variants={fadeUp}
              onClick={() => setSelectedCategory(category)}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className={`
                px-6 py-3 rounded-full font-semibold transition-all duration-300
                ${
                  selectedCategory === category
                    ? 'bg-pink-500 text-white shadow-[0_0_20px_rgba(236,72,153,0.4)]'
                    : 'bg-black/40 backdrop-blur-xl border border-white/10 text-white/70 hover:text-pink-400 hover:border-pink-500/40'
                }
              `}
            >
              {category}
            </motion.button>
          ))}
        </motion.div>

        {/* Animated Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedCategory}
            variants={stagger}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredCertificates.map((certificate) => (
              <motion.div
                key={certificate.id}
                variants={fadeUp}
                layout
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <GlassCard
                  hover
                  glow
                  onClick={() => setSelectedCertificate(certificate)}
                  className="h-full flex flex-col cursor-pointer overflow-hidden"
                >
                  {/* Certificate Image */}
                  {certificate.image && (
                    <motion.div
                      className="relative w-full h-48 mb-4 rounded-lg overflow-hidden"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                    >
                      <Image
                        src={certificate.image}
                        alt={certificate.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </motion.div>
                  )}
                  
                  <div className="flex items-start justify-between mb-4">
                    <Award className="w-8 h-8 text-pink-400 flex-shrink-0" />
                    {certificate.link && (
                      <ExternalLink className="w-5 h-5 text-pink-400/60" />
                    )}
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2 text-white">{certificate.title}</h3>
                  <p className="text-pink-400 text-sm mb-2">{certificate.issuer}</p>
                  <p className="text-white/60 text-sm mb-4">{certificate.date}</p>
                  <p className="text-white/70 text-sm flex-grow line-clamp-3">
                    {certificate.description}
                  </p>
                  
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <span className="text-xs text-pink-400/70 px-3 py-1 rounded-full bg-pink-500/10 inline-block border border-pink-500/20">
                      {certificate.category}
                    </span>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedCertificate && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCertificate(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            />
            
            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-none"
            >
              <GlassCard
                className="max-w-4xl w-full pointer-events-auto max-h-[90vh] overflow-y-auto"
                hover={false}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center border border-pink-500/30">
                      <Award className="w-6 h-6 text-pink-400" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-1">
                        {selectedCertificate.title}
                      </h3>
                      <p className="text-pink-400">{selectedCertificate.issuer}</p>
                    </div>
                  </div>
                  <motion.button
                    onClick={() => setSelectedCertificate(null)}
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>

                {/* Certificate Image in Modal */}
                {selectedCertificate.image && (
                  <motion.div
                    className="relative w-full h-64 md:h-80 mb-6 rounded-lg overflow-hidden"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Image
                      src={selectedCertificate.image}
                      alt={selectedCertificate.title}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, 800px"
                    />
                    <div className="absolute inset-0 border border-white/10 rounded-lg" />
                  </motion.div>
                )}

                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-4 text-sm text-white/60">
                    <span>Issued: {selectedCertificate.date}</span>
                    <span className="px-3 py-1 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20">
                      {selectedCertificate.category}
                    </span>
                  </div>
                  
                  <p className="text-white/80 leading-relaxed">
                    {selectedCertificate.description}
                  </p>
                </div>

                {selectedCertificate.link && (
                  <motion.a
                    href={selectedCertificate.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-pink-500 text-white font-semibold hover:bg-pink-600 transition-colors"
                  >
                    View Certificate
                    <ExternalLink className="w-4 h-4" />
                  </motion.a>
                )}
              </GlassCard>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  )
}
