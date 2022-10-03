import { EProgramStepState, EProgramStepType, IProgramStepRunner } from "../../spec/cycle/IProgramStep";
import { INumericParameterBlockHydrated } from "./blocks/IParameterBlockHydrated";
import { IProgramBlockHydrated } from "./blocks/IProgramBlockHydrated";

export type IProgramStepHydrated = Omit<IProgramStepRunner, "duration" | "isEnabled" | "runAmout" | "startBlocks" | "blocks" | "endBlocks" | "state" | "type" | "progress"> & {
    duration: INumericParameterBlockHydrated,
    isEnabled: INumericParameterBlockHydrated,

    runAmount: INumericParameterBlockHydrated,

    startBlocks: IProgramBlockHydrated[],
    blocks: IProgramBlockHydrated[],
    endBlocks: IProgramBlockHydrated[],

    state: EProgramStepState;
    type: EProgramStepType;

    progress: number

}