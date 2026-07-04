/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/renderer/index.html', './src/renderer/src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#0F0F10',
          0: '#0A0A0B',
          1: '#131316',
          2: '#1A1A1D',
          3: '#222226',
          4: '#2A2A2F',
        },
        line: {
          DEFAULT: 'rgba(255,255,255,0.06)',
          strong: 'rgba(255,255,255,0.10)',
        },
        fg: {
          DEFAULT: '#F5F5F5',
          muted: '#A1A1AA',
          dim: '#71717A',
          faint: '#52525B',
        },
        accent: {
          DEFAULT: '#F5F5F5',
          warm: '#FB923C',
          blue: '#3B82F6',
        },
        success: '#22C55E',
        warn: '#F59E0B',
        danger: '#EF4444',
        info: '#3B82F6',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        md: '0.625rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(0,0,0,0.3)',
        card: '0 0 0 1px rgba(255,255,255,0.06)',
        pop: '0 8px 24px -8px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08)',
      },
      keyframes: {
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'spark-pulse': {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.9' },
          '50%': { transform: 'scale(1.06)', opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fade-in 150ms ease-out',
        'slide-up': 'slide-up 180ms ease-out',
        'spark-pulse': 'spark-pulse 2.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
