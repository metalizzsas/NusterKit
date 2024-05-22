import type { Configuration, MachineSpecsList } from "@metalizzsas/nuster-turbine/types";
import type { PageServerLoad } from "./$types";

export const load = (async ({ fetch}) => {

    const configurationRequest = await fetch(`/api/config/actual`);
    const configuration = await configurationRequest.json() as Configuration;

    const configurationsRequest = await fetch("/api/configs");
    const configurations = await configurationsRequest.json() as MachineSpecsList;

    return {
        configuration,
        configurations
    }

}) satisfies PageServerLoad;