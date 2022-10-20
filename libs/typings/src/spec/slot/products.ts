type MetalfogProductSeriesSubtypes = "act" | "ox" | "rd";

type MetalfogLLC = `llc_${MetalfogProductSeriesSubtypes}`;
type MetalfogUSL = `usl_${MetalfogProductSeriesSubtypes}`;

type RemoveIndex<T, K> = T extends K ? never : T;

/** Product series available with machines */
export type EProductSeries = MetalfogUSL | RemoveIndex<MetalfogLLC, 'llc_act'> |  "tc" | "bc" | "cr" | "any"; 

/**
 * Product details.
 * @warn  Only support lifespan for now but more might be added in the future
 */
export interface ISlotProduct {
    /** 
     * Lifespan of the product in days.
     * If lifespan is `-1`, do not apply deprecation to this product
     */
    lifespan: number
}

/**
 * Hardcoded product data details
 */
export const ESlotProducts: Record<EProductSeries, ISlotProduct> = {
    "llc_ox": { lifespan: 7 },
    "usl_ox": { lifespan: 7 },
    "llc_rd": { lifespan: 7 },
    "usl_rd": { lifespan: 7 },
    "usl_act": { lifespan: 1},
    "tc": { lifespan: 31 },
    "bc": { lifespan: 31 },
    "cr": { lifespan: 60 },
    "any": { lifespan: -1}
}