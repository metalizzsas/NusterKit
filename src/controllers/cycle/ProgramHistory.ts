import { model, Schema } from "mongoose";
import { IParameterBlock } from "../../programblocks/ParameterBlocks";
import { IPBRStatus, IProgram } from "../../programblocks/ProgramBlockRunner";
import { IProgramBlock } from "../../programblocks/ProgramBlocks";
import { IProgramStep } from "../../programblocks/ProgramBlockStep";
import { IWatchdogCondition } from "../../programblocks/Watchdog";

export interface IProgramHistory
{
    rating?: number,
    cycle: IProgram
}

const PBRStatusSchema = new Schema<IPBRStatus>({
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

ParameterBlockSchema.add({params: [ParameterBlockSchema]});

const ProgramBlockSchema = new Schema<IProgramBlock>({
    name: {type: String, required: true},
    executed: {type: Boolean, required: true, default: false},
    params: [ParameterBlockSchema],
});

ProgramBlockSchema.add({blocks: [ProgramBlockSchema]});

const ProgramStepSchema = new Schema<IProgramStep>({
    name: {type: String, required: true},

    state: {type: String, required: true},
    type: {type: String, required: true},

    isEnabled: {type: ParameterBlockSchema, required: true},
    duration: {type: ParameterBlockSchema, required: true},

    runAmount: ParameterBlockSchema,
    runCount: Number,

    startTime: Number,
    endTime: Number,

    blocks: [ProgramBlockSchema]
});

const WatchdogConditionSchema = new Schema<IWatchdogCondition>({
    gateName: {type: String, required: true},
    gateValue: {type: Number, required: true},
    startOnly: {type: Boolean, required: true},
    result: {type: Boolean, required: true, default: false}
});

const ProgramSchema = new Schema<IProgram>({

    name: {type: String, required: true},
    profileIdentifier: String,

    status: {type: PBRStatusSchema, required: true},

    currentStepIndex: Number,

    steps: {type: [ProgramStepSchema], required: true},

    watchdogConditions: {type: [WatchdogConditionSchema], required: true}
});

const ProgramHistorySchema = new Schema<IProgramHistory>({
    rating: Number,
    cycle: {type: ProgramSchema, required: true}
});

export const ProgramHistoryModel = model("history", ProgramHistorySchema);