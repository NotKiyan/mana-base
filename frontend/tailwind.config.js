/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                "primary": "#d4af35",
                "primary-dark": "#8a701e",
                "background-light": "#f8f7f6",
                "background-dark": "#050505",
                "mana-purple": "#6b21a8",
                "mana-teal": "#0f766e",
                "mana-indigo": "#312e81",
                // New Light Mode Palette
                "light-bg": "#fcebf4",
                "light-text": "#062256",
                "light-primary": "#5a0496",
                "light-secondary": "#b023b5",
            },
            fontFamily: {
                "display": ["Inter", "sans-serif"],
                "serif": ["Cinzel", "serif"],
            },
        },
    },
    plugins: [],
}
