/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          purple: '#210440',      // Deep Championship Purple (Primary)
          'purple-dark': '#140129', // Deeper page base
          'purple-deep': '#0D001C', // Deepest background
          'purple-surface': '#2C0854', // Card base
          'purple-elevated': '#380E6B', // Elevated interactive surface
          'purple-border': '#4A138C',  // Subtle purple border
          coral: '#FDB095',       // Soft Coral (Secondary)
          'coral-light': '#FFCDBE',
          'coral-dark': '#E59278',
          rose: '#E5958E',        // Muted Rose (Accent)
          'rose-light': '#F5B7B1',
          gold: '#FFBA00',        // Championship Gold (Highlight)
          'gold-hover': '#FFC933',
          'gold-dark': '#E6A700',
          'gold-subtle': 'rgba(255, 186, 0, 0.15)',
        },
        navy: {
          950: '#140129',
          900: '#210440',
          850: '#2C0854',
          800: '#380E6B',
          700: '#4A138C',
          600: '#611EB5',
        },
        gold: {
          50: '#FFFDF5',
          100: '#FFF8E1',
          200: '#FFECB3',
          300: '#FFDF80',
          400: '#FFCD4D',
          500: '#FFBA00',
          600: '#E6A700',
          700: '#B88500',
          800: '#8A6400',
          900: '#5C4200',
        },
        coral: {
          300: '#FFD7CC',
          400: '#FFC4B0',
          500: '#FDB095',
          600: '#E6977D',
          700: '#C77960',
        },
        rose: {
          300: '#F7C6C2',
          400: '#F0ADA7',
          500: '#E5958E',
          600: '#CC7B74',
          700: '#AD5F58',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        }
      }
    },
  },
  plugins: [],
};
