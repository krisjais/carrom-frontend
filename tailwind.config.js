/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        arena: {
          darkest: '#0B0D0E',
          dark: '#14171A',
          surface: '#1A1E24',
          card: '#1F242C',
          border: '#2A313C',
          hairline: 'rgba(212, 169, 76, 0.2)',
        },
        gold: {
          DEFAULT: '#F2C94C',
          light: '#F7DB82',
          dark: '#D4A94C',
          glow: 'rgba(242, 201, 76, 0.25)',
        },
        offwhite: '#F5F1E8',
        brand: {
          navy: '#1E3258',
          'navy-dark': '#152442',
          'navy-deep': '#0F1A30',
          'navy-surface': '#1E3258',
          'navy-elevated': '#2A457A',
          'navy-border': '#35538C',
          cream: '#FFD691',
          'cream-light': '#FFE7BA',
          'cream-dark': '#ECC177',
          gold: '#D4A94C',
          'gold-light': '#F2C94C',
          'gold-dark': '#BA8D42',
          coral: '#FF6E80',
          'coral-light': '#FF96A4',
          'coral-dark': '#E65366',
        },
        navy: {
          950: '#0F1A30',
          900: '#152442',
          850: '#1E3258',
          800: '#233A66',
          700: '#2A457A',
          600: '#35538C',
          500: '#4A6FA5',
        },
        cream: {
          100: '#FFF6E5',
          200: '#FFECC7',
          300: '#FFE2AA',
          400: '#FFD691',
          500: '#ECC177',
          600: '#D7A859',
        },
        coral: {
          400: '#FF96A4',
          500: '#FF6E80',
          600: '#E65366',
          700: '#C7384A',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Oswald', 'Outfit', 'Inter', 'sans-serif'],
        condensed: ['Oswald', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
};
