import type { Configuration } from "$lib/api/types";
import { fail, redirect } from "@sveltejs/kit";

export const load = (async ({ locals }) => {

    const { data: configsData } = await locals.api.GET("/configs");
    const machineSpecsList = configsData as Record<string, unknown>;

    const machineModelNames = Object.keys(machineSpecsList);

    if(machineModelNames.length === 0)
        throw Error("Failed to get machines list")

    const { data: configData } = await locals.api.GET("/config/actual");
    const configuration = (configData ?? {
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
    }) as Configuration;

    return {
        configuration,
        configurations: machineSpecsList
    }
});

export const actions = {
    saveConfiguration: async ({ locals, request }) => {

        const form = await request.formData();
        const configuration = form.get('configuration')?.toString();

        if(configuration === undefined)
            return fail(400, { saveConfiguration: { error: "Configuration is required" }});

        const { error } = await locals.api.POST("/config", {
            body: JSON.parse(configuration),
        });

        if(!error)
            return redirect(303, "/");
        else
            return fail(400, { saveConfiguration: { error: "Failed to save configuration" }});
    }
}
