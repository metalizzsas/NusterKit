import { writable } from "svelte/store";

export var machineList = writable<{ name: string; ip: string }[]>([]);