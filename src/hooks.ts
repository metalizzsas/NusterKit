import type { GetSession } from "@sveltejs/kit";
import * as cookie from "cookie";

export const getSession: GetSession = async (ctx) => {

    if(ctx.url.pathname.startsWith("/app"))
    {
        const Cookies = cookie.parse(ctx.headers.cookie || '');
        console.log(Cookies);
        return { ip: Cookies["ip"] ?? "127.0.0.1"};
    }
    return {}; 
};