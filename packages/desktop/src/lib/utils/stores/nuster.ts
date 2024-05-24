import { writable } from "svelte/store";
import type { Status } from "@metalizzsas/nuster-turbine/types";

export const realtime = writable<Status>();
export const realtimeLock = writable<boolean>(false);
