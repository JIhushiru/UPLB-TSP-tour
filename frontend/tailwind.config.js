/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        background: 'var(--bg)',
        foreground: 'var(--text)',
        heading: 'var(--text-heading)',
        muted: 'var(--text-secondary)',
        surface: 'var(--surface)',
        input: 'var(--input-border)',
        accent: {
          DEFAULT: 'var(--accent)',
          hover: 'var(--accent-hover)',
          surface: 'var(--accent-surface)',
          border: 'var(--accent-border)',
          foreground: 'var(--accent-text)',
        },
        tag: {
          DEFAULT: 'var(--tag-bg)',
          foreground: 'var(--tag-text)',
        },
      },
      borderColor: {
        DEFAULT: 'var(--border)',
        light: 'var(--border-light)',
        input: 'var(--input-border)',
        accent: 'var(--accent-border)',
      },
      boxShadow: {
        card: 'var(--card-shadow)',
        'card-lg': 'var(--card-shadow-lg)',
        'card-xl': 'var(--card-shadow-xl)',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
      },
      animation: {
        fadeIn: 'fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        slideUp: 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
    },
  },
  plugins: [],
};
