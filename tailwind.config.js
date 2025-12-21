/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{html,js,jsx,ts,tsx}'],
    theme: {
        extend: {
            colors: {
                // Oxocarbon color palette - Premium Dark Edition
                oxo: {
                    base00: '#0a0a0a',
                    base01: '#1a1a1a',
                    base02: '#2a2a2a',
                    base03: '#4a4a4a',
                    base04: '#c8d0d8',
                    base05: '#e8ecf0',
                    base06: '#ffffff',
                    blue: '#6fa0ff',
                    cyan: '#2dd4d1',
                    teal: '#06b8b5',
                    'light-blue': '#75c7ff',
                    'sky-blue': '#2fb8ff',
                    pink: '#ff4d9e',
                    'light-pink': '#ff6eb8',
                    green: '#3bc95f',
                    purple: '#b88dff',
                },
            },
        },
    },
    plugins: [],
}
