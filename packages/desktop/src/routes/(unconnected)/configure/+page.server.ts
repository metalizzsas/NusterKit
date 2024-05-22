import type { Configuration, MachineSpecsList } from "@metalizzsas/nuster-turbine/types";

export const load = (async ({ fetch }) => {

    //TODO: fetch available configurations from server

    const configurationsRequest = await fetch("/api/configs");

    const machineSpecsList = await configurationsRequest.json() as MachineSpecsList;

    const machineModelNames = Object.keys(machineSpecsList);

    if(machineModelNames.length === 0)
        throw Error("Failed to get machines list")

    const configurationRequest = await fetch(`/api/config/actual`);
    const configuration = await configurationRequest.json().catch(() => { return {
        model: machineModelNames.at(0),
        
        name: "Nuster Machine",
        serial: "",
        settings: {
            devMode: true,
            profilesShown: true,
            onlyShowSelectedProfileFields: false,
            hideMultilayerIndications: false,
            variables: []
        },

        addons: [],
        machineAddons: []
    } satisfies Configuration; }) as Configuration;

    return {
        configuration,
        configurations: machineSpecsList
    }
});