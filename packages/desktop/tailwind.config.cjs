/** @type {import("tailwindcss").Config} */
module.exports = {
    darkMode: 'class',
    content: ["./src/**/*.{svelte,ts}"],
    safelist: [],
    theme: {
        extend: {}
    },
    plugins: [require('@tailwindcss/typography')],
}