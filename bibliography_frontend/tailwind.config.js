/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-family-sans)', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['var(--font-family-mono)', 'Fira Code', 'monospace'],
      },
      colors: {
        // ✅ App-wide colors using CSS custom properties (matching editor pattern)
        app: {
          bg: 'var(--color-app-bg)',
          'bg-secondary': 'var(--color-app-bg-secondary)',
          'bg-hover': 'var(--color-app-bg-hover)',
          surface: 'var(--color-app-surface)',
          'surface-hover': 'var(--color-app-surface-hover)',
          accent: 'var(--color-app-accent)',
          'accent-hover': 'var(--color-app-accent-hover)',
          'accent-dark': 'var(--color-app-accent-dark)',
          text: 'var(--color-app-text)',
          'text-primary': 'var(--color-app-text-primary)',
          'text-secondary': 'var(--color-app-text-secondary)',
          'text-muted': 'var(--color-app-text-muted)',
          border: 'var(--color-app-border)',
          'border-hover': 'var(--color-app-border-hover)',
          'border-accent': 'var(--color-app-border-accent)',
        },
      },
      boxShadow: {
        'accent': '0 4px 6px -1px rgba(4, 227, 158, 0.1), 0 2px 4px -1px rgba(4, 227, 158, 0.06)',
        'accent-lg': '0 10px 15px -3px rgba(4, 227, 158, 0.1), 0 4px 6px -2px rgba(4, 227, 158, 0.05)',
        'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'soft-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.03)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '.5' },
        },
      },
    },
  },
  plugins: [],
};
