import { writable } from "svelte/store";
import type { IWSObject } from "./interfaces";

export var machineData = writable<IWSObject>();

export var lockMachineData = writable<boolean>(false);

export var keyboardShown = writable<boolean>(false);
export var keyboardHeight = writable<number>(0);