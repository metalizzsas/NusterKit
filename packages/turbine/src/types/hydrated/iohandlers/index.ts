import type { WAGO, EX260Sx, IOBase } from "../../spec/iohandlers";

export type IOHandlersHydrated = (WAGO | EX260Sx) & IOBase;