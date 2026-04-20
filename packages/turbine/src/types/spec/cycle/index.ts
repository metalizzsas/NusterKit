import type { ProgramBlockRunner } from "./program-block-runner";
import type { PBRStepHydrated } from "../../hydrated/cycle";
import type { PBRRunCondition } from "./pbr-run-condition";

type CyclePremade = {
    /** Name is only for description purposes, not used */
    name: string;
    /** Cycle type name */
    cycle: string;
    /** Profile UUID used by this premade */
    profile?: string;
};

export { CyclePremade, ProgramBlockRunner, PBRStepHydrated, PBRRunCondition };