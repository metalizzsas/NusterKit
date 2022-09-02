/** @type {import("tailwindcss").Config} */
module.exports = {
  darkMode: 'class',
  mode: 'jit',
  content: ["./src/**/*.svelte"],
  safelist: [
    {
      pattern: /./,
      variants: ['sm', 'md', 'lg', 'xl', '2xl'],
    },
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