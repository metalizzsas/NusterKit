import { model, Schema } from "mongoose";

export interface IPassiveStored {
    name: string;
    target: number;
    state: boolean;
}

const PassiveSchema = new Schema<IPassiveStored>({
    name: { type: String, required: true },
    target: { type: Number, required: true },
    state: { type: Boolean, required: true },
});

export const PassiveModel = model("passive", PassiveSchema);
