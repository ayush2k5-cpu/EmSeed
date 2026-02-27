/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'bg-primary':  '#0D0D0D',
        'bg-surface':  '#161616',
        'bg-elevated': '#1F1F1F',
        'text-primary':'#F5F0E8',
        'text-muted':  '#A89E8C',
        'accent-gold': '#C8A97E',
        'accent-green':'#4CAF7A',
        'accent-red':  '#E05A4E',
        'border-subtle':'#2A2A2A',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
        btn:  '8px',
      },
    },
  },
  plugins: [],
}
