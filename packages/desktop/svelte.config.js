import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { default as sveltePreprocess } from "svelte-preprocess";
import adapter from "@sveltejs/adapter-node"

/** @type {import('@sveltejs/kit').Config} */
const config = {
    preprocess: [
        vitePreprocess(),
        sveltePreprocess({ postcss: true })
    ],
    kit: {
        adapter: adapter(),
    },
    
};

export default config;
