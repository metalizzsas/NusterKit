import { sveltekit } from '@sveltejs/kit/vite';

/** @type import('vite').UserConfig */
export default {
    plugins: [sveltekit()],
    server: {
        port: 4081,
        host: "0.0.0.0",
        hmr: {
            path: "/__vite_hmr",
            port: 9026
        }
    },
};