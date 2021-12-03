import { ICycle, ICycleStatus } from "./Cycle";
import { model, Schema } from "mongoose";
import { ProfileSchema } from "../profile/Profile";
import { ICycleStep, ICycleStepInformations } from "./CycleStep";

export interface ICycleHistory
{
    rating?: number,
    cycle: ICycle
}

const CycleStatusSchema = new Schema<ICycleStatus>({
    mode: {type: String, required: true},
    
    startDate: Number,
    endDate: Number,
    endReason: String,

    progress: Number
});

const CycleStepInformationsSchema = new Schema<ICycleStepInformations>({
    isEnabled: {type: Boolean, required: true},

    type: {type: String, required: true},
    state: {type: String, required: true},

    duration: Number,
    startTime: Number,
    endTime: Number,

    runAmount: Number,
    runCount: Number
});

const CycleStepSchema = new Schema<ICycleStep>({
    name: {type: String, required: true},
    status: CycleStepInformationsSchema
});

const CycleSchema = new Schema<ICycle>({
    status: {type: CycleStatusSchema, required: true},
    profile: {type: ProfileSchema, required: true},
    steps: {type: [CycleStepSchema], required: true}
}); 

const CycleHistorySchema = new Schema<ICycleHistory>({
    rating: Number,
    cycle: CycleSchema
});

export const CycleHistoryModel = model("history", CycleHistorySchema);