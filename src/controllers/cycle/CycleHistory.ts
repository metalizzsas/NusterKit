import { ICycleStatus } from "./Cycle";
import { model, Schema } from "mongoose";
import { ProfileSchema } from "../profile/Profile";
import { ICycleStep, ICycleStepInformations } from "./CycleStep";
import { IProgram, IProgramStep } from "../../programblocks/ProgramBlockRunner";
import { IWatchdogCondition } from "../../programblocks/Watchdog";
import { IParameterBlock } from "../../programblocks/ParameterBlocks";
import { IProgramBlock } from "../../programblocks/ProgramBlocks";
import { runInThisContext } from "vm";

export interface ICycleHistory
{
    rating?: number,
    cycle: IProgram
}

const CycleStatusSchema = new Schema<ICycleStatus>({
    mode: {type: String, required: true},
    
    startDate: Number,
    endDate: Number,
    endReason: String,

    progress: Number
});

const ParameterBlockSchema = new Schema<IParameterBlock>({
    name: {type: String, required: true},
    value: {type: String, required: true},
});

const ProgramBlockSchema = new Schema<IProgramBlock>({
    name: {type: String, required: true},
    params: {type: [ParameterBlockSchema], required: true}
});

ProgramBlockSchema.add({
    blocks: {type: [ProgramBlockSchema], required: true}
});

const CycleStepSchema = new Schema<IProgramStep>({
    name: {type: String, required: true},
    isEnabled: {type: ParameterBlockSchema, required: true},
    duration: {type: ParameterBlockSchema, required: true},
    runAmount: {type: ParameterBlockSchema, required: false},
    blocks: [{type: ProgramBlockSchema, required: true}]

});

const WatchdogConditionSchema = new Schema<IWatchdogCondition>({
    gateName: {type: String, required: true},
    gateValue: {type: Number, required: true},
    startOnly: {type: Boolean, required: true},
    result: Boolean
});

const CycleSchema = new Schema<IProgram>({
    name: {type: String, required: true},
    profileIdentifier: {type: String, required: true},

    status: {type: CycleStatusSchema, required: true},
    steps: {type: [CycleStepSchema], required: true},
    watchdogConditions: {type: [WatchdogConditionSchema], required: true}
}); 

const CycleHistorySchema = new Schema<ICycleHistory>({
    rating: Number,
    cycle: CycleSchema
});

export const CycleHistoryModel = model("history", CycleHistorySchema);