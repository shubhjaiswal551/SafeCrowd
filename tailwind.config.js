/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0b0f17',
          secondary: '#111724',
          tertiary: '#192234',
          card: '#131b2a',
        },
        border: {
          subtle: '#1a2436',
          DEFAULT: '#222f46',
          strong: '#334361',
        },
        text: {
          primary: '#f1f5f9',
          secondary: '#94a3b8',
          muted: '#64748b',
        },
        safe: {
          DEFAULT: '#10b981',
          light: '#34d399',
          dark: '#059669',
          bg: 'rgba(16, 185, 129, 0.12)',
        },
        warn: {
          DEFAULT: '#f59e0b',
          light: '#fbbf24',
          dark: '#d97706',
          bg: 'rgba(245, 158, 11, 0.12)',
        },
        danger: {
          DEFAULT: '#ef4444',
          light: '#f87171',
          dark: '#dc2626',
          bg: 'rgba(239, 68, 68, 0.14)',
        },
        critical: {
          DEFAULT: '#dc2626',
          light: '#f87171',
          dark: '#991b1b',
          bg: 'rgba(220, 38, 38, 0.18)',
        },
        accent: {
          DEFAULT: '#00f2fe',
          light: '#38bdf8',
          dark: '#0284c7',
          bg: 'rgba(0, 242, 254, 0.12)',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'ui-monospace', 'Consolas', 'monospace'],
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-safe': '0 0 20px rgba(16, 185, 129, 0.25)',
        'glow-danger': '0 0 24px rgba(239, 68, 68, 0.3)',
        'glow-warn': '0 0 20px rgba(245, 158, 11, 0.25)',
        'glow-accent': '0 0 20px rgba(34, 211, 238, 0.2)',
        'card': '0 1px 2px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2)',
      },
      backgroundImage: {
        'grid-subtle':
          'linear-gradient(rgba(45, 53, 72, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(45, 53, 72, 0.4) 1px, transparent 1px)',
        'grid-faint':
          'linear-gradient(rgba(45, 53, 72, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(45, 53, 72, 0.2) 1px, transparent 1px)',
        'scanline': 'linear-gradient(0deg, transparent 50%, rgba(34, 211, 238, 0.02) 50%)',
      },
      backgroundSize: {
        'grid-sm': '20px 20px',
        'grid-md': '32px 32px',
        'scanline': '100% 4px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan': 'scan 4s linear infinite',
        'slide-in': 'slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        'fade-in': 'fadeIn 0.3s ease-out',
        'ticker': 'ticker 0.6s ease-out',
        'dot-move': 'dotMove 8s linear infinite',
      },
      keyframes: {
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        ticker: {
          '0%': { opacity: '0.5', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        dotMove: {
          '0%': { transform: 'translate(0, 0)' },
          '25%': { transform: 'translate(40px, 20px)' },
          '50%': { transform: 'translate(80px, -10px)' },
          '75%': { transform: 'translate(40px, -30px)' },
          '100%': { transform: 'translate(0, 0)' },
        },
      },
    },
  },
  plugins: [],
}
