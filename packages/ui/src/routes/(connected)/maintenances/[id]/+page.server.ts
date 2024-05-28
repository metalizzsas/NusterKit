import { env } from '$env/dynamic/private';
import { fail, redirect } from '@sveltejs/kit';

export const load = async ({ locals, params }) => {

    const maintenance = locals.machine_status.maintenance.find(m => m.name === params.id);

    if(maintenance === undefined)
        return redirect(302, "/maintenances?not_found=true");

    const maintenanceContentRequest = await fetch(`http://${env.TURBINE_ADDRESS}/static/docs/maintenance-${params.id}/${locals.settings.lang}.md`);
    const maintenanceContent = await maintenanceContentRequest.text();

    return { maintenance, maintenanceContent };
}

export const actions = {
    clearMaintenance: async ({ fetch, request }) => {

        const form = await request.formData();
        const maintenanceName = form.get("maintenance_name")?.toString();

        if(maintenanceName === undefined)
            return fail(400, { clearMaintenance: { error: "Invalid maintenance ID" }});

        const clearRequest = await fetch(`http://${env.TURBINE_ADDRESS}/v1/maintenances/${maintenanceName}`, { method: "DELETE" });

        if(clearRequest.status !== 200 || !clearRequest.ok)
            return fail(500, { clearMaintenance: { error: "Failed to clear maintenance" }});

        return { clearMaintenance: { success: true }};
    }
}