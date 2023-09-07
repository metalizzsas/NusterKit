import type { ProgramBlockRunner } from "./ProgramBlockRunner";

type CyclePremade = {
    /** Name is only for description purposes, not used */
    name: string;
    /** Cycle type name */
    cycle: string;
    /** Profile UUID used by this premade */
    profile?: string;
};

export { CyclePremade, ProgramBlockRunner };