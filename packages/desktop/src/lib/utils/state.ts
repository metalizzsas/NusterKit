import type { ContainerHydrated, IOGatesHydrated, MaintenanceHydrated } from "@metalizzsas/nuster-typings/build/hydrated";

export type State<I, S> = {
    result: "good" | "warn" | "error" | "info";
    issues: Array<I>;
    infos: Array<S>
};

export const computeContainersState = (containers: Array<ContainerHydrated> | ContainerHydrated, ioGates: Array<IOGatesHydrated>): State<"sensor" | "product_unloaded" | "product_lifespan" |  "product_lifespan_unknown", "regulation_active"> => {

    if(!Array.isArray(containers))
        containers = [containers] as Array<ContainerHydrated>;

    let globalResult: State<unknown, unknown>["result"] = "good";
    let globalIssues: Set<"sensor" | "product_unloaded" | "product_lifespan" | "product_lifespan_unknown"> = new Set();
    let globalInfos: Set<"regulation_active"> = new Set();

    for(const container of containers)
    {
        /// — Checking for product validity

        if(container.productData === undefined && container.isProductable === true)
        {
            globalIssues.add("product_unloaded");
            globalResult = "error";
        }

        if(container.productData !== undefined && container.productData.lifetimeRemaining == 0)
        {
            if(container.productData.loadedProductType === "any")
                globalIssues.add("product_lifespan_unknown")
            else
                globalIssues.add("product_lifespan");
            
            globalResult = "warn";
        }
        
        /// - Sensor attached logic tests

        for(const sensor of container.sensors?.filter(k => k.logic !== undefined) ?? [])
        {
            const gate = ioGates.find(k => k.name == sensor.io) as IOGatesHydrated;

            if(sensor.logic === undefined)
                continue;

            if(sensor.logic === "level-min" && gate.value === 0)
            {
                globalIssues.add("sensor");
                globalResult = "error";
            }

            if(sensor.logic === "level-limit-max" && gate.value === 0)
            {
                globalIssues.add("sensor");
                globalResult = "error";
            }

            if(sensor.logic === "presence" && gate.value === 0)
            {
                globalIssues.add("sensor");
                globalResult = "error";
            }
        }

        for(const regulation of container.regulations ?? [])
        {
            if(regulation.state === true)
            {
                globalInfos.add("regulation_active");
                if(globalResult === "good")
                    globalResult = "info";
            }
        }
    }

    return { 
        result: globalResult,
        issues: [...globalIssues],
        infos: [...globalInfos]
    };
}

export const computeMaintenancesState = (maintenances: Array<MaintenanceHydrated> | MaintenanceHydrated): "good" | "warn" | "error" => {

    if(typeof maintenances == "object")
        maintenances = [maintenances] as Array<MaintenanceHydrated>;

    for(const maintenance of maintenances)
    {
        if(maintenance.durationProgress >= 1)
            return "error";
        if(maintenance.durationProgress >= .75)
            return "warn";
    }
    return "good";
}