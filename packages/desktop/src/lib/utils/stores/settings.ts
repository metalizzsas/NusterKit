import { writable } from "svelte/store";

export const lang = writable<string>("en");
export const dark = writable<boolean>(true);