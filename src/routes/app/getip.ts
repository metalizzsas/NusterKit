import type { RequestHandler } from "@sveltejs/kit";
import * as cookie from "cookie";

export const get: RequestHandler = async (ctx) => {

    const Cookies = cookie.parse(ctx.headers.cookie || '');

    return { body: {ip: Cookies["ip"]}};
};