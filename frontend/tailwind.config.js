/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Slightly tighter "enterprise" scale for large text (≈ -2px to -4px vs Tailwind defaults)
        xl: ['1.125rem', { lineHeight: '1.75rem' }], // 18px (was 20px)
        '2xl': ['1.375rem', { lineHeight: '1.875rem' }], // 22px (was 24px)
        '3xl': ['1.75rem', { lineHeight: '2.25rem' }], // 28px (was 30px)
        '4xl': ['2rem', { lineHeight: '2.5rem' }], // 32px (was 36px)
        '5xl': ['2.75rem', { lineHeight: '1' }], // 44px (was 48px)
        '6xl': ['3.5rem', { lineHeight: '1' }], // 56px (was 60px)
        '7xl': ['4.25rem', { lineHeight: '1' }], // 68px (was 72px)
      },
      colors: {
        primary: {
          50: '#e6f7f5',
          100: '#b3e8e0',
          200: '#80d9cb',
          300: '#4dcab6',
          400: '#1abba1',
          500: '#14a085', // Main teal
          600: '#0f7d68',
          700: '#0a5a4b',
          800: '#05372e',
          900: '#001411',
        },
        dark: {
          50: '#f5f5f5',
          100: '#e0e0e0',
          200: '#b3b3b3',
          300: '#808080',
          400: '#4d4d4d',
          500: '#1a1a1a',
          600: '#141414',
          700: '#0f0f0f',
          800: '#0a0a0a',
          900: '#000000',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}
