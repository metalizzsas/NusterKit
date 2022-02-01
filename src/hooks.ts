import type { GetSession } from "@sveltejs/kit";
import * as cookie from "cookie";

export const getSession: GetSession = async (ctx) => {

    if(ctx.url.pathname.startsWith("/app"))
    {
        const Cookies = cookie.parse(ctx.headers.cookie || '');
        return { ip: Cookies["ip"]};
    }
    return {}; 
};