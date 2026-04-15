import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import type { UserConfig } from 'vite';

export default {
    plugins: [tailwindcss(), sveltekit()],
    server: {
        host: "0.0.0.0",
    }
} satisfies UserConfig;