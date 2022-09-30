import { EProductSeries, IConfigSlot } from "../../spec/slot";

/** Slot data for productable slots */
export interface ISlotProductData {
    /** Product series */
    productSeries: EProductSeries;
    /** Porduct load date */
    loadDate: Date;
    /** Product lifetime progress (between 0 and 1) */
    lifetimeProgress: number;
    /** Product lifetime remaining in Milliseconds */
    lifetimeRemaining: number;
}

/** Data returned from slot manager */
export type ISocketSlot = IConfigSlot & { slotData?: ISlotProductData };
