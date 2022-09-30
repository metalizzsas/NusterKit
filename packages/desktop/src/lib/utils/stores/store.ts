import { writable } from "svelte/store";
import type { IStatusMessage } from "webSocketData/index";

export var machineData = writable<IStatusMessage>();
export var lockMachineData = writable<boolean>(false);
