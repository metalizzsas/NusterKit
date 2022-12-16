import { EProgramStepState, EProgramStepType, IProgramStep } from "../../spec/cycle/IProgramStep";
import { Modify } from "../../utils/Modify";
import { NumericParameterBlockHydrated } from "./blocks/ParameterBlockHydrated";
import { ProgramBlockHydrated } from "./blocks/ProgramBlockHydrated";

export type IProgramStepHydrated = Modify<IProgramStep, {
    
    startTime?: number;
    endTime?: number;

    runCount?: number;
    
    isEnabled: NumericParameterBlockHydrated,

    runAmount?: NumericParameterBlockHydrated,

    startBlocks: ProgramBlockHydrated[],
    blocks: ProgramBlockHydrated[],
    endBlocks: ProgramBlockHydrated[],

    state: EProgramStepState;
    type: EProgramStepType;

    progress: number

}>;