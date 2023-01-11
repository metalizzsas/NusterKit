import { writable } from "svelte/store";
import type { Status } from "@metalizzsas/nuster-typings";
import type { MachineData } from "@metalizzsas/nuster-typings/build/hydrated/machine";

export const realtime = writable<Status>();
export const realtimeLock = writable<boolean>(false);

export const machine = writable<MachineData>();
