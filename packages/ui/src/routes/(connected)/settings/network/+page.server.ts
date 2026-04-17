import { fail } from '@sveltejs/kit';

export const load = async ({ locals }) => {

    /** Trigger network scanning */
    await locals.api.GET("/network/wifi/list");
    /** Trigger network devices scanning */
    await locals.api.GET("/network/devices");

    return {};
};

export const actions = {

    /** Connect to a wifi network */
    connectWifi: async ({ locals, request }) => {
        const form = await request.formData();

        const ssid = form.get('ssid')?.toString();
        const password = form.get('password')?.toString();

        if(ssid === undefined)
            return fail(400, { connectWifi: { error: "SSID is required" }});

        const { error } = await locals.api.POST("/network/wifi/connect", {
            body: { ssid, password },
        });

        if(error)
            return fail(403, { connectWifi: { error: "Failed to connect to wifi" }});

        return { connectWifi: { success: true }};

    },
    /**
     * Disconnect from a wifi network
     * @warn do not checks if the request is successful
     */
    disconnectWifi: async ({ locals }) => {
        await locals.api.GET("/network/wifi/disconnect");
        return { disconnectWifi: { success: true }};
    }
}
