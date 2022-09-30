import { IConfigManualMode } from "../../spec/manual";

export type ISocketManual = Omit<IConfigManualMode, "controls" | "watchdog"> & {category: string, locked: boolean, state: number};