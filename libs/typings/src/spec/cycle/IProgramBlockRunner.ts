import { IAdditionalInfo } from "./IAdditionalInfo";
import { IProgramStep } from "./IProgramStep";
import { IPBRStartCondition } from "./security/IPBRStartCondition";

export interface IPBRPremades
{
    name: string;
    profile: string;
    cycle: string;
}

export interface IProgramBlockRunner
{
    name: string;
    profileRequired: boolean;

    startConditions: Array<IPBRStartCondition>;
    steps: Array<IProgramStep>;

    additionalInfo?: Array<IAdditionalInfo>;
}