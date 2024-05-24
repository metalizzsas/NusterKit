import type { MaintenanceHydrated } from "@metalizzsas/nuster-turbine/types/hydrated";
import type { PageServerLoad } from "./$types";

export const load = (async ({ fetch }) => {

    const req = await fetch(`http://${env.TURBINE_ADDRESS}/v1/maintenances/`);
    
    const maintenances = (await req.json() as Array<MaintenanceHydrated>).filter(m => m.name !== "cycleCount"); // Apply filter to hide cycle count

    return {
        maintenances
    }
}) satisfies PageServerLoad;