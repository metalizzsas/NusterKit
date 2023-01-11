import type { ProductSeries } from "../spec/containers/products";

/** Slot database schema */
export type ContainerStored = {
    /** Slot name */
    name: string;
    /** Slot load date */
    loadDate: string;
    /** Slot product series loaded */
    loadedProductType: ProductSeries;
}