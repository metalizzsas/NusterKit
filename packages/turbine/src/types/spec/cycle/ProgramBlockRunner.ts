import type { PBRRunCondition } from "./PBRRunCondition";
import type { PBRStep } from "./PBRStep";

export type ProgramBlockRunner = {
    name: string;
    profileRequired: boolean;

    runConditions: Array<PBRRunCondition>;
    steps: Array<PBRStep>;

    /** AddtionalInfo is an array of Gate names that are displayed when the cycle is running */
    additionalInfo?: Array<string>;
}