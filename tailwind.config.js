/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Noto Sans KR"'],
      },
      backgroundImage: {
        'custom-blue-gradient': 'linear-gradient(to right, #008DE1 0%, #51AEF1 54%, #95CAFF 100%)'
      },
      colors: {
        customGray: '#2F3F4F',
        customMidGray: '#5E7499',
        customLightGray: '#667788',
        custom_blue: '#51AEF1',
        customBarGray: '#273746'

      },

      textShadow: {
        sm: '1px 1px 2px rgba(0,0,0,0.5)',
        DEFAULT: '2px 2px 4px rgba(0,0,0,0.5)',
        lg: '4px 4px 6px rgba(0,0,0,0.6)',
      }
    },
  },
  plugins: [require('tailwindcss-textshadow'),
  require('tailwind-scrollbar-hide'),
  ],
}