module.exports = {
  mode: 'jit',
  content: ["./src/**/*.svelte"],
  theme:{
    extend:{
      animation: {
        'spin-ease': 'spin 1s ease-in-out infinite',
      }
    }
  },
  plugins: [],
}
