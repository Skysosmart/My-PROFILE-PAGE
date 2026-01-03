'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { scaleIn, hoverLift } from '@/lib/motion'

interface GlowButtonProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'outline'
  glow?: boolean
}

export default function GlowButton({ 
  children, 
  className = '', 
  onClick,
  variant = 'primary',
  glow = true
}: GlowButtonProps) {
  const baseStyles = 'relative px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 overflow-hidden'
  
  const variantStyles = {
    primary: 'bg-gradient-to-r from-pink-600 to-pink-500 text-white',
    secondary: 'bg-white/10 text-white hover:bg-white/20',
    outline: 'bg-transparent border-2 border-pink-500 text-pink-400 hover:bg-pink-500/10',
  }

  return (
    <motion.button
      variants={scaleIn}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      whileHover={hoverLift}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${glow && variant === 'primary' ? 'shadow-[0_0_20px_rgba(236,72,153,0.4)]' : ''}
        ${className}
      `}
    >
      <span className="relative z-10">{children}</span>
      {variant === 'primary' && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-pink-400 to-pink-300 opacity-0"
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </motion.button>
  )
}

