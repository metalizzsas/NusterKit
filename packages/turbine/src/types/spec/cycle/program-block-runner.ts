import type { PBRRunCondition } from "./pbr-run-condition";
import type { PBRStep } from "./pbr-step";

/** ProgramBlockRunner is the definitions of a cycle runt by turbine */
export type ProgramBlockRunner = {
    /** Cycle name */
    name: string;

    /** Does this profile always require a profile */
    profileRequired: boolean;
    /** Is this cycle pausable, if set to true the cycle can be paused */
    pausable?: true;

    /** Cycle run conditions */
    runConditions: Array<PBRRunCondition>;

    /** Cycle steps */
    steps: Array<PBRStep>;

    /** AddtionalInfo is an array of Gate names that are displayed when the cycle is running */
    additionalInfo?: Array<string>;
}