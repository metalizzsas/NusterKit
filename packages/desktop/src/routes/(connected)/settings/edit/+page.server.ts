import type { Configuration, MachineSpecsList } from "@metalizzsas/nuster-turbine/types";
import type { PageServerLoad } from "./$types";
import { env } from "$env/dynamic/private";

export const load = (async ({ fetch}) => {

    const configurationRequest = await fetch(`http://${env.TURBINE_ADDRESS}/config/actual`);
    const configuration = await configurationRequest.json() as Configuration;

    const configurationsRequest = await fetch(`http://${env.TURBINE_ADDRESS}/configs`);
    const configurations = await configurationsRequest.json() as MachineSpecsList;

    return {
        configuration,
        configurations
    }

}) satisfies PageServerLoad;