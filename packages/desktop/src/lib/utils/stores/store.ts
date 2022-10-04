import { writable } from "svelte/store";
import type { IStatusMessage } from "@metalizzsas/nuster-typings";

export const machineData = writable<IStatusMessage>();
export const lockMachineData = writable<boolean>(false);
