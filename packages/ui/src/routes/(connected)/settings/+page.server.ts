import type { MaintenanceHydrated } from "@nuster/turbine/types/hydrated";
import type { MachineData } from "@nuster/turbine/types/hydrated/machine";
import { env } from "$env/dynamic/private";
import { fail } from "@sveltejs/kit";

export const load = async ({ fetch }) => {

    const req = await fetch(`http://${env.TURBINE_ADDRESS}/machine`);
    const machine = (await req.json()) as MachineData;

    const reqCycleCount = await fetch(`http://${env.TURBINE_ADDRESS}/v1/maintenances/cycleCount`);
    const cycleCount = await reqCycleCount.json() as MaintenanceHydrated;

    const changelogRequest = await fetch(`http://${env.TURBINE_ADDRESS}/static/CHANGELOG.md`);
    const changelog = await changelogRequest.text();

    return {
        machine,
        cycleCount,
        changelog
    }
}

export const actions = {
    updateSettings: async ({ fetch, request }) => {

        const form = await request.formData();

        const lang = form.get("lang")?.toString();
        const dark = form.get("dark")?.toString();

        if(lang === undefined || dark === undefined)
            return fail(400, { updateSettings: { error: "Missing parameters" }});
        else
        {
            const req = await fetch(`http://${env.TURBINE_ADDRESS}/settings`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ lang, dark })
            });

            if(req.ok && req.status === 200)
                return { updateSettings: { success: true }};
            else
                return fail(403, { updateSettings: { error: "Failed to update settings" }});
        }
    },

    update: async ({ fetch }) => {
        const request = await fetch(`http://${env.TURBINE_ADDRESS}/forceUpdate`);

        if(request.ok && request.status == 200)
            return { update: { success: true }};
        else
            return fail(403, { update: { error: "Failed to start update process" }});
    },

    /** TODO: Check if realtime data permits reboot */
    reboot: async ({ fetch }) => {
        const rebootRequest = await fetch(`http://${env.TURBINE_ADDRESS}/reboot`);

        if(rebootRequest.ok && rebootRequest.status === 200)
            return { reboot: { success: true }};
        else
            return fail(403, { reboot: { error: "Failed to reboot the machine" }});
    },

    /** TODO Check if realtime data permits shutdown */
    shutdown: async ({ fetch }) => {
        const shutdownRequest = await fetch(`http://${env.TURBINE_ADDRESS}/shutdown`);

        if(shutdownRequest.ok && shutdownRequest.status === 200)
            return { shutdown: { success: true }};
        else
            return fail(403, { shutdown: { error: "Failed to shutdown the machine" }});
    }
}