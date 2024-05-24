import type { Handle } from "@sveltejs/kit";
import { env } from "$env/dynamic/private";
import type { MachineData } from "@metalizzsas/nuster-turbine/types/hydrated/machine";

/**
 * Handle hook use to populate locals
 */
export const handle = (async ({ event, resolve }) => {

    // Is UI Served for machine screen ? If so we should display the floating keyboard.
    // We should take care of this User agent as it might change if we update balena-block/browser
    // In dev mode, this will always be true
    event.locals.is_machine_screen = import.meta.env.DEV ? true : (event.request.headers.get("user-agent") == "Mozilla/5.0 (X11; Linux aarch64) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Safari/605.1.15");
    
    const machineData = await new Promise<MachineData | undefined>((resolve) => {
        fetch(`http://${env.TURBINE_ADDRESS}/machine`)
                .then(async res => {
                    if(res.status === 200 && res.ok)
                        resolve(await res.json() as MachineData);
                    resolve(undefined);
                })
                .catch(() => resolve(undefined));

        setTimeout(() => resolve(undefined), 2000);
    });

    if(!machineData && !event.url.pathname.startsWith("/configure"))
        return new Response(null, { headers: { "Location": "/configure" }, status: 302 });

    if(machineData !== undefined && event.url.pathname.startsWith("/configure"))
        return new Response(null, { headers: { "Location": "/" }, status: 302 });

    if(machineData !== undefined) event.locals.machine_configuration = machineData;

    return await resolve(event);

}) satisfies Handle;

/**
 * Handle API Route request from sveltekit internal SSR, using this we bypass NGINX Proxy on dev
 */

// WARNING: THIS SHOULD NOT REROUTE FETCH CALLS, IT IS A BEHAVIOR USED DUE TO THE CONTEXT USED BEFORE
// TODO: REMOVE THIS
/*
export const handleFetch = ( async ({ request }) => {

    if(request.url.includes("http://${env.TURBINE_ADDRESS}/"))
    {
        //Reroute api call to nuster-turbine service
        const newURL = request.url.replace(/(.*)\http://${env.TURBINE_ADDRESS}\//, `http://${import.meta.env.DEV ? "localhost" : "nuster-turbine"}:4080/`);
        return fetch(newURL, request);
    }

    return fetch(request.url, request);

    /* else
    {
        //Reroute /static calls to use correct port as it is behind a nginx proxy
        const newURL = request.url.replace("localhost", `localhost:4081`);
        return fetch(newURL, request);
    } *
    
}) satisfies HandleFetch;
*/