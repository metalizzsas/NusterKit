import type { WAGO, EX260Sx, SerialCom, IOBase } from "../../spec/iohandlers";

export type IOHandlersHydrated = (WAGO | EX260Sx | SerialCom) & IOBase;