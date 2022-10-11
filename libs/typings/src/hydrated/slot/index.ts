import { EProductSeries, IConfigSlot, ISlotSensor } from "../../spec/slot";

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

type ISlotSensorHydrated = ISlotSensor & { value: number, unity?: string }; 

/** Data returned from slot manager */
export type ISlotHydrated = IConfigSlot & { slotData?: ISlotProductData, isProductable: boolean, sensors: ISlotSensorHydrated[] };
