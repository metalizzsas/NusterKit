import type { Configuration, MachineSpecs } from "@metalizzsas/nuster-typings";
import type { PageServerLoad } from "./$types";
import type { ConfigModel, ConfigVariant } from "@metalizzsas/nuster-typings/build/configuration";

export const load = (async ({ fetch, locals }) => {

    const configurationRequest = await fetch(`/api/config/actual`);
    const configuration = await configurationRequest.json() as Configuration;

    const configurationsRequest = await fetch(`/api/config`);
    const configurations = await configurationsRequest.json() as Record<`${ConfigModel}/${ConfigVariant}/${number}`, MachineSpecs>

    return {
        configuration,
        configurations
    }

}) satisfies PageServerLoad;