import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const POST = (async ({ request }) => {

    const { ip, secure = false } = await request.json();

    try {
        const req = await fetch(`${secure ? 'https:' : 'http:'}//${ip}/api/machine/`, { signal: AbortSignal.timeout(2000) });
        return json(await req.json());
    } catch(ex) {
        throw error(404, "unable to connect");
    }

}) satisfies RequestHandler;