/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Background colors (from DesignSystem.md)
        bg: {
          dark: '#0F1115',      // Primary background
          surface: '#171A21',   // Cards, sidebar
          hover: '#1F2330',     // Hover states
        },
        // Border colors
        border: {
          DEFAULT: '#1F2330',   // Default borders
          accent: '#04E39E',    // Accent borders
        },
        // Text colors
        text: {
          primary: '#E6E8EC',   // High contrast
          secondary: '#9CA3AF', // Medium contrast
          muted: '#6B7280',     // Low contrast, hints
        },
        // Accent (neon green)
        accent: {
          DEFAULT: '#04E39E',   // Primary accent
          hover: '#2AF4B4',     // Lighter on hover
          dark: '#03B37A',      // Darker variant
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
};
