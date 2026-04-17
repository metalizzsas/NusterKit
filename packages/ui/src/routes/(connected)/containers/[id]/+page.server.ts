import { env } from '$env/dynamic/private';
import { fail, redirect } from '@sveltejs/kit';

export const load = async ({ locals, params }) => {

    const container = locals.machine_status.containers.find(c => c.name === params.id);

    if(container !== undefined)
        return { container };
    else
        return redirect(302, "/containers?not_found=true");
}

export const actions = {

    updateRegulationState: async ({ params, request, locals }) => {

        const form = await request.formData();

        const sensor = form.get("sensor")?.toString();
        const state = form.get("state")?.toString();

        if(sensor === undefined || state === undefined)
            return fail(400, { updateRegulationState: { error: "Invalid request" }});

        const { error } = await locals.api.POST("/v1/containers/{container}/regulation/{regulation}/state/{state}", {
            params: { path: { container: params.id, regulation: sensor.replace("#", "_"), state: state as "true" | "false" } }
        });

        if(error)
            return fail(500, { updateRegulationState: { error: "Failed to update regulation state" }});

        return { updateRegulationState: { success: true }};

    },

    updateRegulationTarget: async ({ params, request, locals }) => {

        const form = await request.formData();

        const sensor = form.get("sensor")?.toString();
        const target = form.get("target")?.toString();

        if(sensor === undefined || target === undefined)
            return fail(400, { updateRegulationTarget: { error: "Invalid request" }});

        const { error } = await locals.api.POST("/v1/containers/{container}/regulation/{regulation}/target/{target}", {
            params: { path: { container: params.id, regulation: sensor.replace("#", "_"), target } }
        });

        if(error)
            return fail(500, { updateRegulationTarget: { error: "Failed to update regulation target" }});

        return { updateRegulationTarget: { success: true }};

    },

    updateContainerProduct: async ({ params, request, fetch, locals }) => {

        const form = await request.formData();

        const product = form.get("product");
        const actionType = form.get("action_type");

        if(actionType === undefined)
            return fail(400, { updateContainerProduct: { error: "Invalid request" }});

        const callToAction = locals.machine_status.containers.find(c => c.name === params.id)?.callToAction?.find(cta => cta.name === actionType);

        if(callToAction === undefined)
        {
            // Dynamic container action — use raw fetch since it's not a fixed API path
            const updateContainerProductRequest = await fetch(`${env.TURBINE_URL}/v1/containers/${params.id}/${actionType}/${product}`, { method: "post" });

            if(updateContainerProductRequest.status !== 200 || !updateContainerProductRequest.ok)
                return fail(500, { updateContainerProduct: { error: "Failed to update container product" }});

            return { updateContainerProduct: { success: true }};
        }
        else
        {
            if(callToAction.APIEndpoint)
            {
                const callToActionRequest = await fetch(`${env.TURBINE_URL}${callToAction.APIEndpoint.url}`, {
                    method: callToAction.APIEndpoint.method,
                    headers: { 'content-type': 'application/json' },
                    body: (callToAction.APIEndpoint.body) ? JSON.stringify(callToAction.APIEndpoint.body) : undefined
                });

                if(callToActionRequest.ok === false || callToActionRequest.status !== 200)
                    return fail(500, { updateContainerProduct: { error: "Failed to execute call to action" }});
            }

            if(callToAction.UIEndpoint)
                return redirect(302, callToAction.UIEndpoint);
        }
    }
}
