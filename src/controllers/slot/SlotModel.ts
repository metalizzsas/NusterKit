import { Schema, model } from "mongoose";
import { EProductSeries } from "../../interfaces/ISlot";

interface ISlotSchema
{
    name: string;
    loadDate: Date;
    productSeries: EProductSeries;
}

const SlotSchema = new Schema<ISlotSchema>({
    name: { type: String, required: true},
    loadDate: { type: Date, required: true, default: Date.now },
    productSeries: { type: String, required: true}
});

export const SlotModel = model('slot', SlotSchema);