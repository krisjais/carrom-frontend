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
          navy: '#233A66',        // Primary Navy (Main background & dark surfaces)
          'navy-dark': '#152442', // Deepest background tone
          'navy-deep': '#0F1A30', // Extra deep base
          'navy-surface': '#1E3258', // Card base
          'navy-elevated': '#2A457A', // Elevated interactive surface
          'navy-border': '#35538C',  // Subtle navy border
          cream: '#FFD691',       // Primary Cream (CTA, highlights, winners, active states)
          'cream-light': '#FFE7BA',
          'cream-dark': '#ECC177',
          gold: '#D7A859',        // Secondary Gold (Borders, decorative accents)
          'gold-light': '#E5BD78',
          'gold-dark': '#BA8D42',
          coral: '#FF6E80',       // Accent Coral (Special notices, urgent alerts, sparingly)
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
        gold: {
          300: '#F0D199',
          400: '#E5BD78',
          500: '#D7A859',
          600: '#BA8D42',
          700: '#9E7430',
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
      }
    },
  },
  plugins: [],
};
