import { writable } from "svelte/store";
import type { IStatusMessage } from "@metalizzsas/nuster-typings";

export var machineData = writable<IStatusMessage>();
export var lockMachineData = writable<boolean>(false);
