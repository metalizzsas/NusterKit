import { writable } from "svelte/store";

export var keyboardShown = writable<boolean>(false);
export var keyboardHeight = writable<number>(0);