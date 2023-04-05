import type { Handle, HandleFetch } from "@sveltejs/kit";

/**
 * Handle hook use to populate locals
 */
export const handle = (async ({ event, resolve }) => {

    // Is UI Served for machine screen ? If so we should display the floating keyboard.
    // We should take care of this User agent as it might change if we update balena-block/browser
    // In dev mode, this will always be true
    event.locals.is_machine_screen = import.meta.env.DEV ? true : (event.request.headers.get("user-agent") == "Mozilla/5.0 (X11; Linux aarch64) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Safari/605.1.15");

    const machineConfigured = await fetch(`http://${import.meta.env.DEV ? "localhost" : "nuster-turbine"}:4080/machine`).then(res => res.status !== 404).catch(() => false);

    if(machineConfigured === false && !event.url.pathname.startsWith("/configure"))
    {
        return new Response(null, { headers: { "Location": "/configure" }, status: 302 });
    }
    else if(machineConfigured === true && event.url.pathname.startsWith("/configure"))
    {
        return new Response(null, { headers: { "Location": "/" }, status: 302 });
    }

    return await resolve(event);

}) satisfies Handle;

/**
 * Handle API Route request from sveltekit internal SSR, using this we bypass NGINX Proxy
 */
export const handleFetch = ( async ({ request }) => {

    if(request.url.includes("/api/"))
    {
        const newURL = request.url.replace(/(.*)\/api\//, `http://${import.meta.env.DEV ? "localhost" : "nuster-turbine"}:4080/`);
        return fetch(newURL, request);
    }

    return fetch(request);
    
}) satisfies HandleFetch;