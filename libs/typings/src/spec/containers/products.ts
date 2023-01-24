import type { RemoveIndex } from "../../utils/RemoveIndex";

type MetalfogProductSeriesSubtypes = "act" | "ox" | "rd";

type MetalfogLLC = `llc_${MetalfogProductSeriesSubtypes}`;
type MetalfogUSL = `usl_${MetalfogProductSeriesSubtypes}`;

/**
 * Product details.
 * @warn  Only support lifespan for now but more might be added in the future
 */
interface ContainerProduct {
    /** 
     * Lifespan of the product in days.
     * If lifespan is not defined, do not apply deprecation to this product
     */
    lifespan?: number
}

/** Product series available with machines */
type ProductSeries = MetalfogUSL | RemoveIndex<MetalfogLLC, 'llc_act'> |  "tc" | "bc" | "cr" | "any"; 

export { ProductSeries, ContainerProduct };