import { env } from '$env/dynamic/private';
import { fail } from '@sveltejs/kit';

export const actions = {

    editGateValue: async ({ request, fetch }) => {

        // TODO: This could be replaced by an async send via websocket

        const form = await request.formData();

        const gate = form.get('gate')?.toString();
        const value = form.get('value')?.toString();

        if(gate === undefined || value === undefined)
            return fail(400, { editGateValue: { error: "Invalid gate update parameters" }});

        const gateUpdateRequest = await fetch(`http://${env.TURBINE_ADDRESS}/v1/io/${gate.replace("#", "_")}/${value}`, { method: "POST" });

        if(gateUpdateRequest.status !== 200 || !gateUpdateRequest.ok)
            return fail(500, { editGateValue: { error: "Failed to update gate value" }});
        
        return { editGateValue: { success: true }};

    }
}