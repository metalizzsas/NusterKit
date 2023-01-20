import { fail } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load = (async ({ locals }) => {

    try
    {
        const organization = await locals.pb.collection("organization").getOne(locals.user?.organization);
        const users = await locals.pb.collection("users").getFullList();

        return {
            organization: structuredClone(organization),
            users: structuredClone(users)
        }
    }
    catch(ex)
    {
        throw fail(404, { error: "Failed to load organization" });
    }

}) satisfies PageServerLoad;