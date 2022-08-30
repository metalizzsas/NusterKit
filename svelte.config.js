import sveltePreprocess from "svelte-preprocess";
import adapter from "@sveltejs/adapter-node"

console.log(`Vite bundled: ${process.env.VITE_BUNDLED}`);

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter()
  },
  preprocess: sveltePreprocess()
};

export default config;
