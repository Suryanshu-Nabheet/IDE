/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{html,js,jsx,ts,tsx}'],
    theme: {
        extend: {
            colors: {
                // Oxocarbon color palette
                oxo: {
                    base00: '#161616',
                    base01: '#262626',
                    base02: '#393939',
                    base03: '#525252',
                    base04: '#dde1e6',
                    base05: '#f2f4f8',
                    base06: '#ffffff',
                    blue: '#78a9ff',
                    cyan: '#3ddbd9',
                    teal: '#08bdba',
                    'light-blue': '#82cfff',
                    'sky-blue': '#33b1ff',
                    pink: '#ee5396',
                    'light-pink': '#ff7eb6',
                    green: '#42be65',
                    purple: '#be95ff',
                },
            },
        },
    },
    plugins: [],
}
