import { writable } from "svelte/store";

export const keyboardShown = writable<boolean>(false);
export const keyboardHeight = writable<number>(0);