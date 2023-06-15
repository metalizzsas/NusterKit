import type { ProductSeries, ContainerProduct } from "@metalizzsas/nuster-typings/build/spec/containers/products";

/** Hardcoded product data details */
export const Products: Record<ProductSeries, ContainerProduct> = {
    "llc_ox": { lifespan: 7 },
    "usl_ox": { lifespan: 7 },
    "llc_rd": { lifespan: 7 },
    "usl_rd": { lifespan: 7 },
    "usl_act": { lifespan: 0.5 },

    "cv-01": { lifespan: 31 },
    "sv-01": { lifespan: 31 },
    "mv-01": { lifespan: 31 },

    "cr-01": { lifespan: 60 },
    "water": {},
    "any": {}
};