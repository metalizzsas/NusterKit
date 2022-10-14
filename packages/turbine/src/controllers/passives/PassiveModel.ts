import { IPassiveStoredLogData } from "@metalizzsas/nuster-typings/build/hydrated/passive";
import { model, Schema } from "mongoose";

export interface IPassiveStored {
    name: string;
    target: number;
    state: boolean;

    logData: IPassiveStoredLogData[]
}

const PassiveLogDataSchema = new Schema<IPassiveStoredLogData>({
    time: { type: String, required: true },
    targetValue: { type: Number, required: true },
    interpolatedSensorsValue: { type: Number, required: true },
    state: { type: Boolean, default: true}
});

const PassiveSchema = new Schema<IPassiveStored>({
    name: { type: String, required: true },
    target: { type: Number, required: true },
    state: { type: Boolean, required: true },

    logData: { type: [PassiveLogDataSchema], required: true, default: []}
});

export const PassiveModel = model("passive", PassiveSchema);
