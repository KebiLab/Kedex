/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/renderer/index.html', './src/renderer/src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#FFFFFF',
          0: '#FFFFFF',
          1: '#FAFAFA',
          2: '#F4F4F5',
          3: '#E8E8EB',
          4: '#DCDCE0',
        },
        line: {
          DEFAULT: '#E5E5E7',
          strong: '#D4D4D8',
        },
        fg: {
          DEFAULT: '#0D0D0D',
          muted: '#5D5D5D',
          dim: '#8A8A8A',
          faint: '#A8A8AC',
        },
        accent: {
          DEFAULT: '#0D0D0D',
          warm: '#F97316',
        },
        success: '#1A7F37',
        warn: '#9A6700',
        danger: '#D1242F',
        info: '#0969DA',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
      },
      borderRadius: {
        sm: '0.375rem',
        DEFAULT: '0.5rem',
        md: '0.625rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(0,0,0,0.04)',
        card: '0 0 0 1px #E5E5E7',
        pop: '0 8px 24px -8px rgba(0,0,0,0.10), 0 0 0 1px #E5E5E7',
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
