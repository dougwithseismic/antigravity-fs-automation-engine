/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
        './pages/**/*.{ts,tsx}',
        './components/**/*.{ts,tsx}',
        './app/**/*.{ts,tsx}',
        './src/**/*.{ts,tsx}',
        // Include UI package for node components
        '../../packages/ui/src/**/*.{ts,tsx}',
    ],
    theme: {
        extend: {},
    },
    plugins: [],
}
