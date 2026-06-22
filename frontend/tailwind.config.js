/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fbf7',
          100: '#dbf6eb',
          200: '#bdf0d7',
          300: '#94e6bf',
          400: '#B0E4CC', // primary brand tint
          500: '#B0E4CC',
          600: '#7fdcb1',
          700: '#5ac798',
          800: '#3eb081',
          900: '#258f62',
          950: '#115436',
        },
        violet: {
          50: '#f0fbf7',
          100: '#dbf6eb',
          200: '#bdf0d7',
          300: '#94e6bf',
          400: '#B0E4CC',
          500: '#B0E4CC',
          600: '#7fdcb1',
          700: '#5ac798',
          800: '#3eb081',
          900: '#258f62',
          950: '#115436',
        },
        indigo: {
          50: '#f0fbf7',
          100: '#dbf6eb',
          200: '#bdf0d7',
          300: '#94e6bf',
          400: '#B0E4CC',
          500: '#B0E4CC',
          600: '#7fdcb1',
          700: '#5ac798',
          800: '#3eb081',
          900: '#258f62',
          950: '#115436',
        },
        dark: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          750: '#1e293b', // slate-800
          800: '#0f172a', // slate-900
          900: '#020617', // slate-950
        }
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
