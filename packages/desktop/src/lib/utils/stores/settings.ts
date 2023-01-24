import { writable } from "svelte/store";

export const settings = writable<{ lang: string, dark: 1 | 0 }>({ lang: "en", dark: 1 });