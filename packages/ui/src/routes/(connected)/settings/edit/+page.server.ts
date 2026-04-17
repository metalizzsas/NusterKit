import type { Configuration } from "$lib/api/types";
import type { PageServerLoad } from "./$types";
import { env } from "$env/dynamic/private";
import { fail, redirect } from "@sveltejs/kit";

export const load = (async ({ locals, url }) => {

    // Prevent access on restricted pages
    const password = url.searchParams.get('password');
    if(password === undefined || password !== (env.PASSWORD ?? 'Nuster'))
        return redirect(302, '/settings');

    const { data: configData } = await locals.api.GET("/config/actual");
    const configuration = configData as Configuration;

    const { data: configsData } = await locals.api.GET("/configs");
    const configurations = configsData as Record<string, unknown>;

    return {
        configuration,
        configurations
    }

}) satisfies PageServerLoad;

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
