import type { RequestHandler } from "@sveltejs/kit";
import * as cookie from "cookie";

export const get: RequestHandler = async (ctx) => {

    const param = ctx.url.searchParams.get("ip");

    const ip = param || "127.0.0.1";

    // Set cookie
    const headers = {
        'Set-Cookie': cookie.serialize('ip', ip, {
            httpOnly: true,
            sameSite: 'strict',
            path: '/'
        }),
        'Location': "/app"
    };

    return {headers, status: 302};
};