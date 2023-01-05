import type { PBRStartCondition } from "./PBRStartCondition";
import type { PBRStep } from "./PBRStep";

export type ProgramBlockRunner = {
    name: string;
    profileRequired: boolean;

    startConditions: Array<PBRStartCondition>;
    steps: Array<PBRStep>;

    /** AddtionalInfo is an array of Gate names that are displayed when the cycle is running */
    additionalInfo?: Array<string>;
}