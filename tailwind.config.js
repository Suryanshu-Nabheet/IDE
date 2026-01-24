/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{html,js,jsx,ts,tsx}'],
    theme: {
        extend: {
            colors: {
                // UI Colors - All use CSS variables with subtle borders
                'ui-bg': 'var(--ui-bg)',
                'ui-bg-elevated': 'var(--ui-bg-elevated)',
                'ui-bg-subtle': 'var(--ui-bg-subtle)',
                'ui-fg': 'var(--ui-fg)',
                'ui-fg-muted': 'var(--ui-fg-muted)',
                'ui-border': 'rgba(255, 255, 255, 0.06)',
                'ui-border-subtle': 'rgba(255, 255, 255, 0.03)',
                'ui-hover': 'rgba(255, 255, 255, 0.03)',
                'accent': 'var(--accent)',
                'accent-hover': 'var(--accent-hover)',
                
                // Oxocarbon colors (legacy)
                oxo: {
                    base00: '#0a0a0a',
                    base01: '#141414',
                    base02: '#1e1e1e',
                    base03: '#3a3a3a',
                    base04: '#a0a8b0',
                    base05: '#d8dce0',
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
            fontFamily: {
                mono: 'var(--font-mono)',
                sans: 'var(--font-sans)',
            },
        },
    },
    plugins: [],
}
