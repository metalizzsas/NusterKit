import sveltePreprocess from "svelte-preprocess";
import adapter from "@sveltejs/adapter-static";
import { VitePWA } from "vite-plugin-pwa";
import { pwaConfiguration } from "./pwa-configuration.js";

console.log(`Vite bundled: ${process.env.VITE_BUNDLED}`);

/** @type {import('@sveltejs/kit').Config} */
const config = {
  experimental: {
    inspector: true
  },
  kit: {
    adapter: adapter({
      fallback: "index.html",
    }),
    vite: {
      plugins: [VitePWA(pwaConfiguration)]
    }
  },
  preprocess: sveltePreprocess()
};

export default config;
