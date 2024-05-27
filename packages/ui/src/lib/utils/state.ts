import type { ContainerHydrated, IOGatesHydrated, MaintenanceHydrated } from "@nuster/turbine/types/hydrated";

export type State<I, S> = {
    result: "good" | "warn" | "error" | "info";
    issues: Array<I>;
    infos: Array<S>
};

export const computeContainersState = (containers: Array<ContainerHydrated> | ContainerHydrated, ioGates: Array<IOGatesHydrated>): State<"sensor" | "product_unloaded" | "product_lifespan" |  "product_lifespan_unknown", "regulation_active"> => {

    if(!Array.isArray(containers))
        containers = [containers] as Array<ContainerHydrated>;

    let globalResult: State<unknown, unknown>["result"] = "good";
    const globalIssues: Set<"sensor" | "product_unloaded" | "product_lifespan" | "product_lifespan_unknown"> = new Set();
    const globalInfos: Set<"regulation_active"> = new Set();

    for(const container of containers)
    {
        /// — Checking for product validity

        if(container.productData === undefined && container.isProductable === true)
        {
            globalIssues.add("product_unloaded");
            globalResult = "error";
        }

        if(container.productData !== undefined && !(container.productData.lifetimeRemaining > 0))
        {
            if(container.productData.lifetimeRemaining === -1)
                globalIssues.add("product_lifespan_unknown")
            
            if(container.productData.lifetimeRemaining === 0)
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

    if(!(maintenances instanceof Array))
        maintenances = [maintenances] as Array<MaintenanceHydrated>;

    const hasError = maintenances.some(k => k.durationProgress >= 1 || k.durationProgress === -1);
    const hasWarn = maintenances.some(k => k.durationProgress >= .75);

    if(hasError)
        return "error";
    
    if(hasWarn)
        return "warn";
    
    return "good";
}