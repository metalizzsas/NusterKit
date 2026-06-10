import type { Handle } from "@sveltejs/kit";
import { env } from "$env/dynamic/private";
import { createTurbineClient } from "$lib/api/client";
import type { MachineData, Status } from "$lib/types/turbine";
import { locale } from "svelte-i18n";

/**
 * Handle hook use to populate locals
 */
export const handle = (async ({ event, resolve }) => {
    // Is UI Served for machine screen ? If so we should display the floating keyboard.
    // We should take care of this User agent as it might change if we update balena-block/browser
    // In dev mode, this will always be true
    event.locals.is_machine_screen = import.meta.env.DEV ? true : (event.request.headers.get("user-agent") == "Mozilla/5.0 (X11; Linux aarch64) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Safari/605.1.15");

    // Create typed API client and store in locals
    const api = createTurbineClient(env.TURBINE_URL);
    event.locals.api = api;

    const currentPath = event.url.pathname;
    const redirect = (path: string) => new Response(null, { headers: { "Location": path }, status: 302 });

    // Try to fetch machine data.
    // NB: openapi-fetch ne LÈVE PAS sur erreur HTTP (404/500) — il renvoie
    // { data: undefined, response }. Il faut donc tester response.ok / data,
    // sinon une machine non configurée (404) passait quand même en "connected"
    // avec machine_configuration undefined -> crash de la sidebar, et la page
    // /configure n'était jamais atteinte.
    let machineData: MachineData | undefined;
    try {
        const { data, response } = await api.GET("/machine");
        if (response.ok && data) {
            machineData = data as MachineData;
        } else {
            // Pas de machine prête : turbine est-elle configurée ?
            const { response: cfgResponse } = await api.GET("/config/actual");
            if (cfgResponse.status === 404) {
                // Non configurée -> page de configuration
                return currentPath.startsWith("/configure") ? resolve(event) : redirect("/configure");
            }
            // Configurée mais machine pas encore prête -> loading
            return currentPath.startsWith("/loading") ? resolve(event) : redirect("/loading");
        }
    } catch {
        // turbine injoignable (erreur réseau) -> loading
        return currentPath.startsWith("/loading") ? resolve(event) : redirect("/loading");
    }

    // Machine data retrieved successfully
    if (currentPath.startsWith("/configure") || currentPath.startsWith("/loading")) {
        return redirect("/");
    }

    // Populate locals with machine data
    const [settingsResult, realtimeResult] = await Promise.all([
        api.GET("/settings"),
        api.GET("/realtime")
    ]);

    const { theme, lang } = settingsResult.data as { theme: "1" | "0", lang: string };
    const realtimeData = realtimeResult.data as Status;

    event.locals.machine_configuration = machineData!;
    event.locals.settings = {
        dark: parseInt(theme) as 1 | 0,
        lang
    };
    locale.set(lang);
    event.locals.machine_status = realtimeData;

    return await resolve(event, {
        transformPageChunk: ({ html }) => {
            const language = event.locals.settings?.lang ?? "en";
            const darkMode = event.locals.settings?.dark === 1 ? "dark" : "";
            return html.replace("%lang%", language).replace("%dark%", darkMode);
        }
    });
}) satisfies Handle;
