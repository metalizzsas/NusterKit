import type { Handle } from "@sveltejs/kit";
import util from "node:util";

export const handle = (async ({ event, resolve }) => {

    const dev = import.meta.env.DEV;

    let ip = event.request.headers.get("Host")?.split(":").at(0);
    
    if(ip === undefined)
    {
        ip = event.request.headers.get("host")?.split(":")?.at(0);
    }

    const notSecure = event.url.protocol === "http:";

    console.log(util.inspect(event.request, false, null, true));
    console.log("ip", ip);
    console.log("secure", notSecure);

    const httpProtocol = notSecure ? "http:" : "https:";
    const wsProtocol = notSecure ? "ws:" : "wss:";

    const endpoint = dev ? `${ip}:4080` : ip;

    event.locals.nuster_api_host = `${httpProtocol}//${endpoint}`;
    event.locals.nuster_ws_host = `${wsProtocol}//${endpoint}`;
    
    // Is UI Served for machine screen ? If so we should display the floating keyboard.
    // We should take care of this User agent as it might change if we update balena-block/browser
    // In dev mode, this will always be true
    event.locals.is_machine_screen = dev ? true : (event.request.headers.get("user-agent") == "Mozilla/5.0 (X11; Linux aarch64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36");

    const response = await resolve(event);
    return response;

}) satisfies Handle;