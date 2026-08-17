/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#040814',
          900: '#080E1E',
          850: '#0B152B',
          800: '#0F1B38',
          700: '#1A2C5B',
          600: '#253E80',
        },
        gold: {
          50: '#FDFBF5',
          100: '#FAF5E6',
          200: '#F3E7C0',
          300: '#EBD89A',
          400: '#DFC265',
          500: '#D4AF37',
          600: '#BA9726',
          700: '#947518',
          800: '#6E550F',
          900: '#4D3B0A',
        },
        board: {
          wood: '#8B5A2B',
          felt: '#EAE6DF',
          red: '#DC2626',
          black: '#1E293B',
          white: '#F8FAFC'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shine': 'shine 2s linear infinite',
      },
      keyframes: {
        shine: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        }
      }
    },
  },
  plugins: [],
};

export default config;
