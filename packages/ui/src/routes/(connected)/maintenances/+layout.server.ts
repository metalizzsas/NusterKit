import type { MaintenanceHydrated } from "$lib/types/turbine";

export const load = async ({ locals }) => {

    const { data } = await locals.api.GET("/v1/maintenances/");

    const maintenances = (data as MaintenanceHydrated[]).filter(m => m.name !== "cycleCount"); // Apply filter to hide cycle count

    return {
        maintenances
    }
};
