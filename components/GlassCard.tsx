'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { fadeUp, hoverLift } from '@/lib/motion'

interface GlassCardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  glow?: boolean
  delay?: number
  onClick?: () => void
}

export default function GlassCard({ 
  children, 
  className = '', 
  hover = true,
  glow = false,
  delay = 0,
  onClick
}: GlassCardProps) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      transition={{ delay }}
      whileHover={hover ? hoverLift : undefined}
      onClick={onClick}
      className={`
        relative rounded-2xl p-6
        bg-black/40 backdrop-blur-xl
        border border-white/10
        ${hover || onClick ? 'transition-all duration-300 cursor-pointer' : ''}
        ${hover ? 'hover:border-pink-500/40' : ''}
        ${glow ? 'hover:shadow-[0_0_30px_rgba(236,72,153,0.3)]' : ''}
        ${className}
      `}
    >
      {children}
    </motion.div>
  )
}

