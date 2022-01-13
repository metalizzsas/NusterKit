const production = false;
module.exports = {
  future: {
    purgeLayersByDefault: true,
    removeDeprecatedGapUtilities: true,
  },
  plugins: [

  ],
  theme:{
    extend:{
      animation: {
        'spin-ease': 'spin 1s ease-in-out infinite',
      }
    }
  },
  purge: {
    content: [
     "./src/**/*.svelte",

    ],
    enabled: production // disable purge in dev
  },
  safeList: [
    "justify-items-start",
    "justify-items-end"
  ]
};