import type { Configuration } from "@metalizzsas/nuster-typings";
import type { PageServerLoad } from "./$types";

export const load = (async ({ fetch }) => {

    const configurationRequest = await fetch(`/api/config/actual`);
    const configuration = await configurationRequest.json().catch(() => { return {
        model: "metalfog",
        variant: "m",
        revision: 1,

        name: "unknown",
        serial: "",
        settings: {
            devMode: true,
            profilesShown: true,
            variables: []
        },

        addons: [],
        machineAddons: []
    } satisfies Configuration; }) as Configuration;

    const configurations = structuredClone((await import("@metalizzsas/nuster-turbine-machines")).Machines);

    return {
        configuration,
        configurations
    }

}) satisfies PageServerLoad;