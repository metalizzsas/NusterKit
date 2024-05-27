import { writable } from "svelte/store";
import type { Status } from "@nuster/turbine/types";

export const realtime = writable<Status>();
export const realtimeLock = writable<boolean>(false);
export const realtimeConnected = writable<boolean>(false);
