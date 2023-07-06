import { sveltekit } from '@sveltejs/kit/vite';
import type { UserConfig } from 'vite';
import { documentationCopy } from "./documentation";

export default {
    plugins: [
        sveltekit(),
        documentationCopy()
    ],
    server: {
        port: 4081,
        host: "0.0.0.0",
        hmr: {
            path: "/__vite_hmr",
            port: 9026
        }
    },
    build: {
        rollupOptions: {
            external: [
                "/version.txt?raw"
            ]
        }
    }
} satisfies UserConfig;