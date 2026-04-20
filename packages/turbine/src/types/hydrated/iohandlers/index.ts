import type { EX260Sx, IOBase, WAGO } from "../../spec/iohandlers";

export type IOHandlersHydrated = (WAGO | EX260Sx) & IOBase;
