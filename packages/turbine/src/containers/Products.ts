import type { ProductSeries, ContainerProduct } from "@metalizzsas/nuster-typings/build/spec/containers/products";

/** Hardcoded product data details */
export const Products: Record<ProductSeries, ContainerProduct> = {
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