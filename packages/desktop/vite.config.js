import { sveltekit } from '@sveltejs/kit/vite';
import { changelog } from './changelog';

/** @type {import('vite').UserConfig} */
const config = {
        plugins: [sveltekit(), changelog()],
        ssr: {
                noExternal: ["@fontsource/montserrat"]
        }
};

export default config;