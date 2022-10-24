import { IOGates } from "../../spec/iogates";
import { IConfigSlot, ISlotSensor } from "../../spec/slot";
import { EProductSeries } from "../../spec/slot/products";
import { IRegulationHydrated } from "./regulation";

/** Slot data for productable slots */
export interface ISlotProductData {
    /** Product series */
    loadedProductType: EProductSeries;
    /** Porduct load date */
    loadDate: Date;
    /** Product lifetime remaining in Milliseconds */
    lifetimeRemaining: number;
}

export type ISlotSensorHydrated = Omit<ISlotSensor, "io" | "regulation"> & { io?: IOGates, regulation?: IRegulationHydrated }; 

/** Data returned from slot manager */
export type ISlotHydrated = Omit<IConfigSlot, 'io'> & { io: IOGates, productData?: ISlotProductData, isProductable: boolean, sensors: ISlotSensorHydrated[] };
