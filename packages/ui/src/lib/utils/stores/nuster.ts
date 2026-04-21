import { writable } from "svelte/store";
import type { Status } from "$lib/types/turbine";

export const realtime = writable<Status>({
	containers: [],
	io: [],
	maintenance: [],
	network: { accessPoints: [], devices: [] },
});
export const realtimeLock = writable<boolean>(false);
export const realtimeConnected = writable<boolean>(false);
