import { writable } from "svelte/store";
import type { Status } from "@metalizzsas/nuster-turbine/types";
import type { MachineData } from "@metalizzsas/nuster-turbine/types/hydrated/machine";

export const realtime = writable<Status>();
export const realtimeLock = writable<boolean>(false);

export const machine = writable<MachineData>();
