import type { Handle, HandleFetch } from "@sveltejs/kit";

/**
 * Handle hook use to populate locals
 */
export const handle = (async ({ event, resolve }) => {

    // Is UI Served for machine screen ? If so we should display the floating keyboard.
    // We should take care of this User agent as it might change if we update balena-block/browser
    // In dev mode, this will always be true
    event.locals.is_machine_screen = import.meta.env.DEV ? true : (event.request.headers.get("user-agent") == "Mozilla/5.0 (X11; Linux aarch64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36");

    const response = await resolve(event);
    return response;

}) satisfies Handle;

/**
 * Handle API Route request from sveltekit internal SSR, using this we bypass NGINX Proxy
 */
export const handleFetch = ( async ({ request }) => {

    if(request.url.includes("/api/"))
    {
        return fetch(request.url.replace("/api/", ":4080/api/"), request);
    }

    return fetch(request);
    
}) satisfies HandleFetch;