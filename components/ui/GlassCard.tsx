'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  glow?: boolean
  delay?: number
}

export default function GlassCard({ 
  children, 
  className = '', 
  hover = true,
  glow = false,
  delay = 0
}: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6, delay }}
      className={`
        glass-strong rounded-2xl p-6
        ${hover ? 'transition-all duration-300' : ''}
        ${hover ? 'hover:scale-105 hover:border-pink-500/40' : ''}
        ${glow ? 'hover:glow-pink' : ''}
        ${className}
      `}
    >
      {children}
    </motion.div>
  )
}

