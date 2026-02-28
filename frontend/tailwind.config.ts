import type { Config } from 'tailwindcss'

const config: Config = {
    content: ['./index.html', './src/**/*.{ts,tsx}'],
    theme: {
        extend: {
            colors: {
                peach: '#FFD2C2',
                teal: '#789A99',
                lemon: '#FEFACD',
                violet: '#5F4A8B',
                void: '#0A0A0F',
                ghost: '#E8E0FF',
                ember: '#C8A96E',
                offwhite: '#F5F0E8',
                muted: '#9E9E9E',
            },
            fontFamily: {
                serif: ['"DM Serif Display"', 'serif'],
                sans: ['"DM Sans"', 'sans-serif'],
            },
        },
    },
    plugins: [],
}

export default config
