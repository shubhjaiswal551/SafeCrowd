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
          primary: '#090a0e',
          secondary: '#0f1218',
          tertiary: '#161a22',
          card: '#12161f',
        },
        border: {
          subtle: '#1c222c',
          DEFAULT: '#252d3a',
          strong: '#364052',
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
          bg: 'rgba(16, 185, 129, 0.08)',
        },
        warn: {
          DEFAULT: '#f59e0b',
          light: '#fbbf24',
          dark: '#d97706',
          bg: 'rgba(245, 158, 11, 0.08)',
        },
        danger: {
          DEFAULT: '#ef4444',
          light: '#f87171',
          dark: '#dc2626',
          bg: 'rgba(239, 68, 68, 0.10)',
        },
        critical: {
          DEFAULT: '#dc2626',
          light: '#f87171',
          dark: '#991b1b',
          bg: 'rgba(220, 38, 38, 0.14)',
        },
        accent: {
          DEFAULT: '#3b82f6',
          light: '#60a5fa',
          dark: '#2563eb',
          bg: 'rgba(59, 130, 246, 0.10)',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'ui-monospace', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'glow-safe': '0 0 10px rgba(16, 185, 129, 0.12)',
        'glow-danger': '0 0 12px rgba(239, 68, 68, 0.15)',
        'glow-warn': '0 0 10px rgba(245, 158, 11, 0.12)',
        'glow-accent': '0 0 10px rgba(59, 130, 246, 0.12)',
        'card': '0 1px 3px rgba(0, 0, 0, 0.35)',
      },
      backgroundImage: {
        'grid-subtle':
          'linear-gradient(rgba(38, 45, 58, 0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(38, 45, 58, 0.25) 1px, transparent 1px)',
        'grid-faint':
          'linear-gradient(rgba(38, 45, 58, 0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(38, 45, 58, 0.12) 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid-sm': '16px 16px',
        'grid-md': '24px 24px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.2s ease-out',
        'ticker': 'ticker 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        ticker: {
          '0%': { opacity: '0.6' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
