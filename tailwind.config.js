/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Syne', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
      },
      colors: {
        px: {
          bg:      '#0A0A0A',
          surface: '#111111',
          card:    '#161616',
          border:  '#222222',
          muted:   '#333333',
          dim:     '#555555',
          mid:     '#888888',
          light:   '#CCCCCC',
          white:   '#F0F0F0',
          accent:  '#E8E8E8',
        },
      },
      letterSpacing: {
        widest2: '0.25em',
        widest3: '0.35em',
      },
    },
  },
  plugins: [],
}