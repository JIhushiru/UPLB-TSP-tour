/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
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
      animation: {
        fadeIn: 'fadeIn 0.3s ease',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
