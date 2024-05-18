import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { default as sveltePreprocess } from "svelte-preprocess";
import adapter from "@sveltejs/adapter-node"

/** @type {import('@sveltejs/kit').Config} */
const config = {
    kit: {
        adapter: adapter(),
    },
    preprocess: [
        vitePreprocess(),
        sveltePreprocess({ postcss: true })
    ],
};

export default config;
