import type { RequestHandler } from "@sveltejs/kit";
import * as cookie from "cookie";

export const get: RequestHandler = async (ctx) => {

    const param = ctx.url.searchParams.get("ip");

    console.log("received ipd", param);

    const ip = param || "127.0.0.1";

    // Set cookie
    const headers = {
        'Set-Cookie': cookie.serialize('ip', ip, {
            httpOnly: true,
            maxAge: 60 * 60 * 24 * 7,
            sameSite: 'strict',
            path: '/'
        })
    };

    return {headers, body: {ip: ip}};
};