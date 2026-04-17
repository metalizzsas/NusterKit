import type { MaintenanceHydrated } from "$lib/types/turbine";
import type { MachineData } from "$lib/types/turbine";
import { env } from "$env/dynamic/private";
import { fail, redirect } from "@sveltejs/kit";

export const load = async ({ locals, fetch }) => {

    const { data: machineData } = await locals.api.GET("/machine");
    const machine = machineData as MachineData;

    const { data: cycleCountData } = await locals.api.GET("/v1/maintenances/{name}", {
        params: { path: { name: "cycleCount" } }
    });
    const cycleCount = cycleCountData as MaintenanceHydrated;

    // Static file fetch — stays as raw fetch
    const changelogRequest = await fetch(`${env.TURBINE_URL}/static/CHANGELOG.md`);
    const changelog = await changelogRequest.text();

    return {
        machine,
        cycleCount,
        changelog
    }
}

export const actions = {

    advancedLogin: async ({ request }) => {

        const form = await request.formData();
        const password = form.get("password")?.toString();

        if(password === undefined)
            return fail(400, { advancedLogin: { error: "Missing password" }});

        if(password !== (env.PASSWORD ?? 'Nuster'))
            return fail(403, { advancedLogin: { error: "Invalid password" }});

        return redirect(302, `/settings/edit?password=${password}`);

    },

    updateSettings: async ({ locals, request }) => {

        const form = await request.formData();

        const lang = form.get("lang")?.toString();
        const dark = form.get("dark")?.toString();

        if(lang === undefined || dark === undefined)
            return fail(400, { updateSettings: { error: "Missing parameters" }});
        else
        {
            const { error } = await locals.api.POST("/settings", {
                body: { lang, theme: dark },
            });

            if(!error)
                return { updateSettings: { success: true }};
            else
                return fail(403, { updateSettings: { error: "Failed to update settings" }});
        }
    },

    update: async ({ locals }) => {
        const { error } = await locals.api.GET("/forceUpdate");

        if(!error)
            return { update: { success: true }};
        else
            return fail(403, { update: { error: "Failed to start update process" }});
    },

    /** TODO: Check if realtime data permits reboot */
    reboot: async ({ locals }) => {
        const { error } = await locals.api.GET("/reboot");

        if(!error)
            return { reboot: { success: true }};
        else
            return fail(403, { reboot: { error: "Failed to reboot the machine" }});
    },

    /** TODO Check if realtime data permits shutdown */
    shutdown: async ({ locals }) => {
        const { error } = await locals.api.GET("/shutdown");

        if(!error)
            return { shutdown: { success: true }};
        else
            return fail(403, { shutdown: { error: "Failed to shutdown the machine" }});
    }
}
