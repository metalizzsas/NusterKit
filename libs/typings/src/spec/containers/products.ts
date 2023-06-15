import type { RemoveIndex } from "../../utils/RemoveIndex";

type MetalfogProductSeriesSubtypes = "act" | "ox" | "rd";

type MetalfogLLC = `llc_${MetalfogProductSeriesSubtypes}`;
type MetalfogUSL = `usl_${MetalfogProductSeriesSubtypes}`;

type MetalfogProductSeries = MetalfogUSL | RemoveIndex<MetalfogLLC, 'llc_act'>;
type SmoothitProductSeries = "cv-01" | "sv-01" | "mv-01";
type USCleanerProductSeries = "cr-01" | "water" | "any";

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
type ProductSeries = MetalfogProductSeries |  SmoothitProductSeries | USCleanerProductSeries;

export { ProductSeries, ContainerProduct };