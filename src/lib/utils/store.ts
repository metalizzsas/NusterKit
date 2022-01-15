import { writable } from "svelte/store";
import type { IWSObject } from "./interfaces";

export let machineList = writable<IMachine[]>([{
    serial: "null",
    name: "metalfogx1",
    ipAddress: "127.0.0.1",

    model: "metalfog",
    modelVariant: "m",
    modelRevision: 1
}]);

export let selectedMachine = writable<IMachine>();

export interface IMachine {
    serial: string;
    name: string;
    ipAddress: string;

    model: string;
    modelVariant: string;
    modelRevision: number;
}
export var machineData = writable<IWSObject>();