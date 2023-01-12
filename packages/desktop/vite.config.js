import { sveltekit } from '@sveltejs/kit/vite';

/** @type import('vite').UserConfig */
export default {
    plugins: [sveltekit()],
    ssr: {
        noExternal: ["@fontsource/inter"],
    },
    server: {
        port: 4081,
        host: "0.0.0.0",
    },
};