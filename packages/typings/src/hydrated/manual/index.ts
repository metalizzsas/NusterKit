import { IConfigManualMode } from "../../spec/manual";

export type IManualHydrated = Omit<IConfigManualMode, "controls" | "watchdog"> & {category: string, locked: boolean, state: number};