import { env } from "$env/dynamic/private";
import type { Configuration, MachineSpecsList } from "@nuster/turbine/types";
import { fail, redirect } from "@sveltejs/kit";

export const load = (async ({ fetch }) => {

    const machineSpecsListRequest = await fetch(`http://${env.TURBINE_ADDRESS}/configs`);
    const machineSpecsList = await machineSpecsListRequest.json() as MachineSpecsList;

    const machineModelNames = Object.keys(machineSpecsList);

    if(machineModelNames.length === 0)
        throw Error("Failed to get machines list")

    const configurationRequest = await fetch(`http://${env.TURBINE_ADDRESS}/config/actual`);
    const configuration = await configurationRequest.json().catch(() => { return {
        model: machineModelNames[0],
        
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
    } satisfies Omit<Configuration, "$schema">; }) as Configuration;

    return {
        configuration,
        configurations: machineSpecsList
    }
});

export const actions = {
    saveConfiguration: async ({ fetch, request }) => {

        const form = await request.formData();
        const configuration = form.get('configuration')?.toString();

        if(configuration === undefined)
            return fail(400, { saveConfiguration: { error: "Configuration is required" }});

        const saveRequest = await fetch(`http://${env.TURBINE_ADDRESS}/config/`, {
            method: 'post',
            headers: {
                'content-type': 'application/json'
            },
            body: configuration
        });

        if(saveRequest.ok && saveRequest.status === 200)
            return redirect(303, "/");
        else
            return fail(400, { saveConfiguration: { error: "Failed to save configuration" }});
    }
}