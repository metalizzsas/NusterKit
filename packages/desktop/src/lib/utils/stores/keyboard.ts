import { writable } from "svelte/store";

export const keyboardLeft = writable<number>(0);
export const keyboardTop = writable<number>(0);