import type { Handle } from "@sveltejs/kit";
import { env } from "$env/dynamic/private";
import type { MachineData } from "@nuster/turbine/types/hydrated/machine";
import type { Status } from "@nuster/turbine/types";
import { locale } from "svelte-i18n";

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

    /// — Fill locals if machine data is available
    if(machineData !== undefined)
    {
        const settingsRequest = await fetch(`http://${env.TURBINE_ADDRESS}/settings`);
        const realtimeDataRequest = await fetch(`http://${env.TURBINE_ADDRESS}/realtime`);

        const { dark, lang } = await settingsRequest.json() as { dark: "1" | "0", lang: string };
        
        const realtimeData = await realtimeDataRequest.json() as Status;

        event.locals.machine_configuration = machineData;
        event.locals.settings = {
            dark: parseInt(dark) as 1 | 0,
            lang
        };
        locale.set(lang);
        event.locals.machine_status = realtimeData;
    } 

    return await resolve(event, {
        transformPageChunk: ({ html }) => {

            if(event.locals.settings === undefined)
                return html.replace("%lang%", "en").replace("%dark%", "");

            const lang = event.locals.settings.lang;
            const dark = event.locals.settings.dark === 1 ? "dark" : "";

            return html.replace("%lang%", lang).replace("%dark%", dark)
        }
    });

}) satisfies Handle;