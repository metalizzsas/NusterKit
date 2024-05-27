import type { ProgramBlockRunner } from "./ProgramBlockRunner";
import type { PBRStepHydrated } from "../../hydrated/cycle";
import type { PBRRunCondition } from "./PBRRunCondition";

type CyclePremade = {
    /** Name is only for description purposes, not used */
    name: string;
    /** Cycle type name */
    cycle: string;
    /** Profile UUID used by this premade */
    profile?: string;
};

export { CyclePremade, ProgramBlockRunner, PBRStepHydrated, PBRRunCondition };