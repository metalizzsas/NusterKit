import type { MaintenanceHydrated } from "@metalizzsas/nuster-typings/build/hydrated";
import type { PageServerLoad } from "./$types";
import type { MachineData } from "@metalizzsas/nuster-typings/build/hydrated/machine";
import { PUBLIC_NUSTER_VERSION } from "$env/static/public";

export const load = ( async ({ fetch }) => {

    const req = await fetch(`/api/machine`);
    const machine = (await req.json()) as MachineData;

    const reqCycleCount = await fetch(`/api/v1/maintenances/cycleCount`);
    const cycleCount = await reqCycleCount.json() as MaintenanceHydrated;

    return {
        machine,
        cycleCount,
        version: (PUBLIC_NUSTER_VERSION as string)
    }

}) satisfies PageServerLoad;