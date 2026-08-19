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
        // Strict CarromPro Light Palette
        floral: {
          DEFAULT: '#FAF9F6',
          50: '#FFFFFF',
          100: '#FAF9F6',
          200: '#F4EFE6',
          300: '#EAE1D0',
        },
        espresso: {
          DEFAULT: '#4A4238',
          50: '#F5F3F0',
          100: '#EAE5E0',
          200: '#D5CDC4',
          300: '#B0A396',
          400: '#7E7060',
          500: '#4A4238',
          600: '#3E342B',
          700: '#2C241E',
          800: '#1F1914',
          900: '#140F0C',
        },
        khaki: {
          DEFAULT: '#D5C4A1',
          light: '#E6DCBF',
          lighter: '#F4EFE6',
          dark: '#B8A47E',
          border: 'rgba(213, 196, 161, 0.45)',
        },
        'accent-red': {
          DEFAULT: '#E74C3C',
          hover: '#D63031',
          light: '#FDEDEC',
        },

        // Night Mode Championship Arena Tokens
        night: {
          bg: '#0B0D0E',
          surface: '#121517',
          secondary: '#181C1F',
          card: '#15191C',
          elevated: '#1B2024',
          border: '#2B3034',
          text: '#F5F1E8',
          muted: '#B8B1A5',
          subtle: '#817B72',
          gold: '#D4A94C',
          success: '#3FA878',
          footer: '#07090A',
        },

        // Semantic aliases
        main: '#FAF9F6',
        card: '#FFFFFF',
        darkfooter: '#3E342B',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'editorial': '0 2px 8px -2px rgba(74, 66, 56, 0.08), 0 1px 3px -1px rgba(74, 66, 56, 0.04)',
        'editorial-hover': '0 12px 28px -6px rgba(74, 66, 56, 0.12), 0 4px 10px -2px rgba(74, 66, 56, 0.06)',
        'night-card': '0 4px 20px -4px rgba(0, 0, 0, 0.5), 0 0 0 1px #2B3034',
        'night-elevated': '0 12px 32px -4px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(212, 169, 76, 0.2)',
        'coin': 'inset 0 1px 2px rgba(255, 255, 255, 0.3), 0 2px 6px rgba(74, 66, 56, 0.25)',
        'coin-white': 'inset 0 1px 2px rgba(255, 255, 255, 0.8), 0 2px 6px rgba(74, 66, 56, 0.12)',
        'coin-queen': 'inset 0 1px 2px rgba(255, 255, 255, 0.4), 0 3px 8px rgba(231, 76, 60, 0.35)',
      },
      animation: {
        'live-pulse': 'pulse 1.8s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
};

