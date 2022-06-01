import { writable } from "svelte/store";
import type { IWSObject } from "./interfaces";

export var machineData = writable<IWSObject>();

export var lockMachineData = writable<boolean>(false);