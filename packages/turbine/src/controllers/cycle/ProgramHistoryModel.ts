import { model, Schema } from "mongoose";
import { ProfileSchema } from "../profile/ProfileModel";

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

const ProgramBlockSchema = new Schema<IProgramBlock & {currentIteration?: number, trueBlocks?: IProgramBlock, falseBlocks?: IProgramBlock}>({
    name: {type: String, required: true},
    executed: {type: Boolean, required: true, default: false},
    params: [ParameterBlockSchema],
    currentIteration: Number, // for for-loop only
});

ProgramBlockSchema.add({blocks: [ProgramBlockSchema]});

//for if block only
ProgramBlockSchema.add({trueBlocks: [ProgramBlockSchema]}); 
ProgramBlockSchema.add({falseBlocks: [ProgramBlockSchema]});

const ProgramStepSchema = new Schema<IProgramStepRunner>({
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

const PBRStartConditionSchema = new Schema<IPBRStartCondition>({
    conditionName: {type: String, required: true},
    startOnly: {type: Boolean, required: true},
    checkChain: {type: PBRSCCheckChainSchema, required: true}
});

const ProgramSchema = new Schema<IProgramRunner>({

    name: {type: String, required: true},

    status: {type: PBRStatusSchema, required: true},

    currentStepIndex: Number,

    steps: {type: [ProgramStepSchema], required: true},

    startConditions: {type: [PBRStartConditionSchema], required: true}
});

const ProgramHistorySchema = new Schema<IProgramHistory>({
    rating: Number,
    cycle: {type: ProgramSchema, required: true},
    profile: ProfileSchema
});

export const ProgramHistoryModel = model("history", ProgramHistorySchema);