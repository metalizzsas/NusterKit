import { Schema, model } from "mongoose";

export interface IPassiveStored {
    name: string;
    target: number;
    state: boolean;

    logData: IPassiveStoredLogData[]
}

export interface IPassiveStoredLogData {
    time?: Date,
    state?: boolean

    targetValue: number,
    interpolatedSensorsValue: number,
}

const PassiveLogDataSchema = new Schema<IPassiveStoredLogData>({
    time: { type: Date, default: Date.now },
    targetValue: { type: Number, required: true },
    interpolatedSensorsValue: { type: Number, required: true },
    state: { type: Boolean, default: false}
});

const PassiveSchema = new Schema<IPassiveStored>({
    name: { type: String, required: true },
    target: { type: Number, required: true },
    state: { type: Boolean, required: true },

    logData: { type: [PassiveLogDataSchema], required: false, default: []}
});

export const PassiveModel = model("passive", PassiveSchema);
