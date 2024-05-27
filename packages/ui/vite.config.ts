import { sveltekit } from '@sveltejs/kit/vite';
import type { UserConfig } from 'vite';

export default {
    plugins: [sveltekit()],
    server: {
        port: 4081,
        host: "0.0.0.0",
        hmr: {
            path: "/__vite_hmr",
            port: 9026
        }
    }
} satisfies UserConfig;