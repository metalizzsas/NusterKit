import type { MaintenanceHydrated } from "@metalizzsas/nuster-turbine/types/hydrated";
import { fail } from "@sveltejs/kit";
import { env } from "$env/dynamic/private";

export const load = async ({ fetch }) => {

    const req = await fetch(`http://${env.TURBINE_ADDRESS}/v1/maintenances/`);
    
    const maintenances = (await req.json() as Array<MaintenanceHydrated>).filter(m => m.name !== "cycleCount"); // Apply filter to hide cycle count

    return {
        maintenances
    }
};

export const actions = {
    clearMaintenance: async ({ fetch, request }) => {

        const form = await request.formData();
        const maintenanceName = form.get("maintenance_name")?.toString();

        if(maintenanceName === undefined)
            return fail(400, { clearMaintenance: { error: "Invalid maintenance ID" }});

        const clearRequest = await fetch(`http://${env.TURBINE_ADDRESS}/v1/maintenances/${maintenanceName}`, { method: "DELETE" });

        if(clearRequest.status !== 200 || clearRequest.ok)
            return fail(500, { clearMaintenance: { error: "Failed to clear maintenance" }});

        return { clearMaintenance: { success: true }};
    }
}