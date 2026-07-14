import type { Config } from 'tailwindcss'

/**
 * Terminal / retro-game theme.
 * Palette is intentionally NOT pure black+green: a mint "phosphor" green is the
 * primary, cyan is the secondary, and lime/amber carry the "selected" highlight.
 */
const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './data/**/*.{js,ts}',
  ],
  theme: {
    extend: {
      colors: {
        // Backgrounds (neutral near-black)
        void: '#050505',   // deepest background
        panel: '#101010',  // panel / window fill
        ink: '#151515',    // raised surface
        // Monochrome family (was phosphor green, now white/grey)
        phosphor: {
          DEFAULT: '#ffffff',
          dim: '#bdbdbd',
          deep: '#4d4d4d',
        },
        cyan: {
          DEFAULT: '#d0d0d0',
          dim: '#8a8a8a',
        },
        lime: '#ffffff',   // highlight
        amber: '#cfcfcf',  // status accent (grey)
        magenta: '#e0e0e0',// accents
        muted: '#7a7a7a',  // dim body text / borders
      },
      fontFamily: {
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
        pixel: ['var(--font-pixel)', 'var(--font-mono)', 'monospace'],
        crt: ['var(--font-crt)', 'var(--font-mono)', 'monospace'],
      },
      boxShadow: {
        'glow-sm': '0 0 8px rgba(255,255,255,0.3)',
        'glow': '0 0 14px rgba(255,255,255,0.3), 0 0 40px rgba(255,255,255,0.1)',
        'glow-cyan': '0 0 14px rgba(255,255,255,0.32), 0 0 40px rgba(255,255,255,0.1)',
        'glow-lime': '0 0 16px rgba(255,255,255,0.4), 0 0 44px rgba(255,255,255,0.12)',
      },
      keyframes: {
        blink: { '0%,49%': { opacity: '1' }, '50%,100%': { opacity: '0' } },
        flicker: {
          '0%,100%': { opacity: '1' },
          '3%': { opacity: '0.82' },
          '6%': { opacity: '1' },
          '9%': { opacity: '0.9' },
          '12%': { opacity: '1' },
        },
        scan: { '0%': { transform: 'translateY(-100%)' }, '100%': { transform: 'translateY(100%)' } },
        'fade-up': { '0%': { opacity: '0', transform: 'translateY(16px)' }, '100%': { opacity: '1', transform: 'none' } },
        drift: { '0%': { transform: 'translateY(0)' }, '100%': { transform: 'translateY(-40px)' } },
        'pulse-glow': {
          '0%,100%': { textShadow: '0 0 6px rgba(87,255,176,0.5)' },
          '50%': { textShadow: '0 0 14px rgba(87,255,176,0.9), 0 0 26px rgba(87,255,176,0.4)' },
        },
      },
      animation: {
        blink: 'blink 1s step-end infinite',
        flicker: 'flicker 6s linear infinite',
        scan: 'scan 7s linear infinite',
        'fade-up': 'fade-up 0.6s cubic-bezier(0.16,1,0.3,1) both',
        drift: 'drift 20s linear infinite alternate',
        'pulse-glow': 'pulse-glow 2.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
export default config
