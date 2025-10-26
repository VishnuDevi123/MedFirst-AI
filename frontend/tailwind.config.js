/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0066CC',
          foreground: '#FFFFFF',
        },
        success: '#10B981',
        destructive: '#EF4444',
        warning: '#F59E0B',
        background: '#FFFFFF',
        foreground: '#1F2937',
        muted: {
          DEFAULT: '#F9FAFB',
          foreground: '#6B7280',
        },
        border: '#E5E7EB',
      },
      borderRadius: {
        DEFAULT: '0.5rem',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Courier New', 'monospace'],
      },
    },
  },
  plugins: [],
}
