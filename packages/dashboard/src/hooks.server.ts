import type { Handle } from '@sveltejs/kit';
import PocketBase from 'pocketbase';

export const handle = (async ({ event, resolve }) => {

    event.locals.pb = new PocketBase("http://127.0.0.1:8091/");

    event.locals.pb.authStore.loadFromCookie(event.request.headers.get('cookie') || '');

    if(event.locals.pb.authStore.isValid && event.locals.pb.authStore.model !== null)
    {
        try
        {
            const user = await event.locals.pb.collection("users").getOne(event.locals.pb.authStore.model.id, { expand: "organization" });
            event.locals.user = structuredClone(user);
        }
        catch(ex)
        {
            event.locals.user = undefined;
        }
    }
    else
    {
        event.locals.user = undefined;
    }

    if(event.route.id?.startsWith("/app") && event.locals.user === undefined)
    {
        return new Response(null, {status: 303, headers: { 'location': '/' }});
    }
    else
    {
        const response = await resolve(event);
        response.headers.set('set-cookie', event.locals.pb.authStore.exportToCookie({ secure: false }));

        return response;
    }

}) satisfies Handle;