import { env } from '$env/dynamic/private';
import { fail, redirect } from '@sveltejs/kit';

export const load = async ({ locals, params }) => {

    const maintenance = locals.machine_status.maintenance.find(m => m.name === params.id);

    if(maintenance === undefined)
        return redirect(302, "/maintenances?not_found=true");

    // Static file fetch — not an API route, stays as raw fetch
    const maintenanceContentRequest = await fetch(`${env.TURBINE_URL}/static/docs/maintenance-${params.id}/${locals.settings.lang}.md`);
    const maintenanceContent = await maintenanceContentRequest.text();

    return { maintenance, maintenanceContent };
}

export const actions = {
    clearMaintenance: async ({ locals, request }) => {

        const form = await request.formData();
        const maintenanceName = form.get("maintenance_name")?.toString();

        if(maintenanceName === undefined)
            return fail(400, { clearMaintenance: { error: "Invalid maintenance ID" }});

        const { error } = await locals.api.DELETE("/v1/maintenances/{name}", {
            params: { path: { name: maintenanceName } }
        });

        if(error)
            return fail(500, { clearMaintenance: { error: "Failed to clear maintenance" }});

        return { clearMaintenance: { success: true }};
    }
}
