import type { Configuration, MachineSpecsList } from "@nuster/turbine/types";
import type { PageServerLoad } from "./$types";
import { env } from "$env/dynamic/private";
import { fail, redirect } from "@sveltejs/kit";

export const load = (async ({ fetch, url }) => {

    // Prevent access on restricted pages
    const password = url.searchParams.get('password');
    if(password === undefined || password !== (env.PASSWORD ?? 'Nuster'))
        return redirect(302, '/settings');

    const configurationRequest = await fetch(`http://${env.TURBINE_ADDRESS}/config/actual`);
    const configuration = await configurationRequest.json() as Configuration;

    const configurationsRequest = await fetch(`http://${env.TURBINE_ADDRESS}/configs`);
    const configurations = await configurationsRequest.json() as MachineSpecsList;

    return {
        configuration,
        configurations
    }

}) satisfies PageServerLoad;

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