/** @type {import("tailwindcss").Config} */
module.exports = {
  darkMode: 'class',
  content: ["./src/**/*.svelte"],
  safelist: [
    {
      pattern: /(from|to|bg)-.*/
    },
    {
      pattern: /(h|w)-.*/
    },
    "overflow-hidden"
  ],
  theme:{
    extend:{
      animation: {
        'spin-ease': 'spin 1s ease-in-out infinite',
        'spin-reverse': 'spin 2s linear infinite reverse',
      }
    }
  },
  plugins: [],
}