import { env } from '$env/dynamic/private';
import { fail } from '@sveltejs/kit';

export const load = async ({ fetch }) => {

    /** Trigger network scanning */
    await fetch(`http://${env.TURBINE_ADDRESS}/network/wifi/list`);
    /** Trigger network devices scanning */
    await fetch(`http://${env.TURBINE_ADDRESS}/network/devices`);

    return {};
};

export const actions = {

    /** Connect to a wifi network */
    connectWifi: async ({ fetch, request }) => {
        const form = await request.formData();

        const ssid = form.get('ssid')?.toString();
        const password = form.get('password')?.toString();

        if(ssid === undefined)
            return fail(400, { connectWifi: { error: "SSID is required" }});

        const connectRequest = await fetch(`http://${env.TURBINE_ADDRESS}/network/wifi/connect`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ssid, password }) });

        if(connectRequest.status !== 200 || !connectRequest.ok)
            return fail(403, { connectWifi: { error: "Failed to connect to wifi" }});

        return { connectWifi: { success: true }};

    },
    /** 
     * Disconnect from a wifi network
     * @warn do not checks if the request is successful
     */
    disconnectWifi: async ({ fetch }) => {
        await fetch(`http://${env.TURBINE_ADDRESS}/network/wifi/disconnect`);
        return { disconnectWifi: { success: true }};
    }
}