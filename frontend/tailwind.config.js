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
          primary: '#f8fafc',
          secondary: '#ffffff',
          tertiary: '#f1f5f9',
          card: '#ffffff',
        },
        border: {
          subtle: '#f1f5f9',
          DEFAULT: '#e2e8f0',
          strong: '#cbd5e1',
        },
        text: {
          primary: '#0f172a',
          secondary: '#475569',
          muted: '#94a3b8',
        },
        safe: {
          DEFAULT: '#059669',
          light: '#047857',
          dark: '#065f46',
          bg: 'rgba(5, 150, 105, 0.08)',
        },
        warn: {
          DEFAULT: '#d97706',
          light: '#b45309',
          dark: '#92400e',
          bg: 'rgba(217, 119, 6, 0.08)',
        },
        danger: {
          DEFAULT: '#dc2626',
          light: '#b91c1c',
          dark: '#991b1b',
          bg: 'rgba(220, 38, 38, 0.08)',
        },
        critical: {
          DEFAULT: '#991b1b',
          light: '#7f1d1d',
          dark: '#450a0a',
          bg: 'rgba(153, 27, 27, 0.10)',
        },
        accent: {
          DEFAULT: '#2563eb',
          light: '#3b82f6',
          dark: '#1d4ed8',
          bg: 'rgba(37, 99, 235, 0.08)',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
        sans: ['"Plus Jakarta Sans"', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'glass': '0 8px 30px rgba(15, 23, 42, 0.04), 0 1px 2px rgba(15, 23, 42, 0.02)',
        'specular': 'inset 0 1px 1px rgba(255, 255, 255, 0.95), 0 8px 24px -4px rgba(15, 23, 42, 0.05)',
        'floating': '0 20px 40px -12px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(226, 232, 240, 0.8)',
      },
      backgroundImage: {
        'grid-subtle':
          'linear-gradient(rgba(226, 232, 240, 0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(226, 232, 240, 0.6) 1px, transparent 1px)',
        'grid-faint':
          'linear-gradient(rgba(241, 245, 249, 0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(241, 245, 249, 0.8) 1px, transparent 1px)',
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
