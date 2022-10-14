import { model, Schema } from "mongoose";
import { ProfileSchema } from "../profile/ProfileModel";

import type { IProgramBlockRunnerHydrated } from "@metalizzsas/nuster-typings/build/hydrated/cycle/IProgramRunnerHydrated";
import { IPBRStatus } from "@metalizzsas/nuster-typings/build/spec/cycle/IProgramBlockRunner";
import { IParameterBlocksHydrated } from "@metalizzsas/nuster-typings/build/hydrated/cycle/blocks/IParameterBlockHydrated";
import { IProgramBlockHydrated } from "@metalizzsas/nuster-typings/build/hydrated/cycle/blocks/IProgramBlockHydrated";
import { IProgramStepHydrated } from "@metalizzsas/nuster-typings/build/hydrated/cycle/IProgramStepHydrated";
import { IPBRSCCheckChain } from "@metalizzsas/nuster-typings/build/spec/cycle/programblocks/startchain/IPBRSCCheckChain";
import { IPBRStartConditionHydrated } from "@metalizzsas/nuster-typings/build/hydrated/cycle/IPBRStartConditionHydrated";
import { IHistory } from "@metalizzsas/nuster-typings/build/hydrated/cycle";

const PBRStatusSchema = new Schema<IPBRStatus>({
    mode: {type: String, required: true},
    startDate: Number,
    endDate: Number,
    endReason: String,
    progress: Number
});

const ParameterBlockSchema = new Schema<IParameterBlocksHydrated>({
    name: {type: String, required: true},
    value: String,
    data: Schema.Types.Mixed
});

ParameterBlockSchema.add({params: [ParameterBlockSchema]});

const ProgramBlockSchema = new Schema<IProgramBlockHydrated>({
    name: {type: String, required: true},
    executed: {type: Boolean, required: true, default: false},
    params: [ParameterBlockSchema],
    currentIteration: Number, // for for-loop only
});

ProgramBlockSchema.add({blocks: [ProgramBlockSchema]});

//for if block only
ProgramBlockSchema.add({trueBlocks: [ProgramBlockSchema]}); 
ProgramBlockSchema.add({falseBlocks: [ProgramBlockSchema]});

const ProgramStepSchema = new Schema<IProgramStepHydrated>({
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

const PBRSCCheckChainSchema = new Schema<IPBRSCCheckChain>({
    name: {type: String, required: true},

    parameter: ParameterBlockSchema,
    io: {
        gateName: {type: String},
        gateValue: {type: String}
    }
});

const PBRStartConditionSchema = new Schema<IPBRStartConditionHydrated>({
    conditionName: {type: String, required: true},
    startOnly: {type: Boolean, required: true},
    checkChain: {type: PBRSCCheckChainSchema, required: true},
    result: Boolean
});

const ProgramSchema = new Schema<IProgramBlockRunnerHydrated>({

    name: {type: String, required: true},

    status: {type: PBRStatusSchema, required: true},

    currentStepIndex: Number,

    steps: {type: [ProgramStepSchema], required: true},

    startConditions: {type: [PBRStartConditionSchema], required: true}
});

const ProgramHistorySchema = new Schema<IHistory>({
    rating: Number,
    cycle: {type: ProgramSchema, required: true},
    profile: ProfileSchema
});

export const ProgramHistoryModel = model("history", ProgramHistorySchema);