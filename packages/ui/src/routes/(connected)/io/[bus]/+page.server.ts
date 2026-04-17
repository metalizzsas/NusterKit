import { fail } from '@sveltejs/kit';

export const actions = {

    editGateValue: async ({ request, locals }) => {

        // TODO: This could be replaced by an async send via websocket

        const form = await request.formData();

        const gate = form.get('gate')?.toString();
        const value = form.get('value')?.toString();

        if(gate === undefined || value === undefined)
            return fail(400, { editGateValue: { error: "Invalid gate update parameters" }});

        const { error } = await locals.api.POST("/v1/io/{name}/{value}", {
            params: { path: { name: gate.replace("#", "_"), value } }
        });

        if(error)
            return fail(500, { editGateValue: { error: "Failed to update gate value" }});

        return { editGateValue: { success: true }};

    }
}
