import type { EProductSeries } from "@metalizzsas/nuster-typings/build/spec/slot";
import { model, Schema } from "mongoose";

/** Slot database schema */
interface ISlotSchema
{
    /** Slot name */
    name: string;
    /** Slot load date */
    loadDate: Date;
    /** Slot product series loaded */
    productSeries: EProductSeries;
}

const SlotSchema = new Schema<ISlotSchema>({
    name: { type: String, required: true},
    loadDate: { type: Date, required: true, default: Date.now },
    productSeries: { type: String, required: true}
});

export const SlotModel = model('slot', SlotSchema);