import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load = (async ({locals}) => {

    if(locals.user !== undefined)
    {
        locals.pb.authStore.clear();
        locals.user = undefined;
    }

    throw redirect(303, "/");

}) satisfies PageServerLoad;