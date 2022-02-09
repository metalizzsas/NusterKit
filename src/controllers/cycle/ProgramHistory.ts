import { model, Schema } from "mongoose";
import { IParameterBlock } from "../../interfaces/IParameterBlock";
import { IProfile } from "../../interfaces/IProfile";
import { IProgramBlock } from "../../interfaces/IProgramBlock";
import { IProgram, IPBRStatus } from "../../interfaces/IProgramBlockRunner";
import { IProgramStep } from "../../interfaces/IProgramStep";
import { IWatchdogCondition } from "../../interfaces/IWatchdogCondition";
import { IForLoopProgramBlock } from "../../programblocks/ProgramBlocks";
import { ProfileSchema } from "../profile/Profile";

export interface IProgramHistory
{
    rating?: number,
    cycle: IProgram,
    profile: IProfile
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
    value: String
});

ParameterBlockSchema.add({params: [ParameterBlockSchema]});

const ProgramBlockSchema = new Schema<IProgramBlock & IForLoopProgramBlock>({
    name: {type: String, required: true},
    executed: {type: Boolean, required: true, default: false},
    params: [ParameterBlockSchema],
    currentIteration: Number, // for for-loop only
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

    blocks: [ProgramBlockSchema],

    startBlocks: [ProgramBlockSchema],
    endBlocks: [ProgramBlockSchema],
});

const WatchdogConditionSchema = new Schema<IWatchdogCondition>({
    gateName: {type: String, required: true},
    gateValue: {type: Number, required: true},
    startOnly: {type: Boolean, required: true},
    result: {type: Boolean, required: true, default: false}
});

const ProgramSchema = new Schema<IProgram>({

    name: {type: String, required: true},

    status: {type: PBRStatusSchema, required: true},

    currentStepIndex: Number,

    steps: {type: [ProgramStepSchema], required: true},

    watchdogConditions: {type: [WatchdogConditionSchema], required: true}
});

const ProgramHistorySchema = new Schema<IProgramHistory>({
    rating: Number,
    cycle: {type: ProgramSchema, required: true},
    profile: ProfileSchema
});

export const ProgramHistoryModel = model("history", ProgramHistorySchema);