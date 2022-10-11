import { writable } from "svelte/store";

export const machineList = writable<{ name: string; ip: string }[]>([]);