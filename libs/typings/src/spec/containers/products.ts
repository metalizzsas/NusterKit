import type { RemoveIndex } from "../../utils/RemoveIndex";

type MetalfogProductSeriesSubtypes = "act" | "ox" | "rd";

type MetalfogLLC = `llc_${MetalfogProductSeriesSubtypes}`;
type MetalfogUSL = `usl_${MetalfogProductSeriesSubtypes}`;

/**
 * Product details.
 * @warn  Only support lifespan for now but more might be added in the future
 */
interface ISlotProduct {
    /** 
     * Lifespan of the product in days.
     * If lifespan is not defined, do not apply deprecation to this product
     */
    lifespan?: number
}

/** Product series available with machines */
type ProductSeries = MetalfogUSL | RemoveIndex<MetalfogLLC, 'llc_act'> |  "tc" | "bc" | "cr" | "any"; 

/**
 * Hardcoded product data details
 */
const Products: Record<ProductSeries, ISlotProduct> = {
    "llc_ox": { lifespan: 7 },
    "usl_ox": { lifespan: 7 },
    "llc_rd": { lifespan: 7 },
    "usl_rd": { lifespan: 7 },
    "usl_act": { lifespan: 1},
    "tc": { lifespan: 31 },
    "bc": { lifespan: 31 },
    "cr": { lifespan: 60 },
    "any": {}
}

export { ProductSeries, Products };