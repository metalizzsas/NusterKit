import type { MaintenanceHydrated } from "@metalizzsas/nuster-typings/build/hydrated";
import type { PageServerLoad } from "./$types";

export const load = (async ({ fetch, locals }) => {

    const req = await fetch(`/api/v1/maintenances/`);
    
    const maintenances = (await req.json() as Array<MaintenanceHydrated>).filter(m => m.name !== "cycleCount"); // Apply filter to hide cycle count

    return {
        maintenances
    }
}) satisfies PageServerLoad;