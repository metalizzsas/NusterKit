import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { default as sveltePreprocess } from "svelte-preprocess";
import adapter from "@sveltejs/adapter-node"
import { fileURLToPath } from "url";
import { readFileSync } from "fs";

const file = fileURLToPath(new URL('package.json', import.meta.url));
const json = readFileSync(file, 'utf8');
const pkg = JSON.parse(json);

/** @type {import('@sveltejs/kit').Config} */
const config = {
    preprocess: [
        vitePreprocess(),
        sveltePreprocess({ postcss: true })
    ],
    kit: {
        adapter: adapter(),
        version: {
            name: pkg.version
        }
    },
    
};

export default config;
