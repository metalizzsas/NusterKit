import type { PageServerLoad } from "./$types";
import type { ProfileHydrated } from "@metalizzsas/nuster-typings/build/hydrated/profiles";

export const load = (async ({ fetch, params }) => {

    const req = await fetch(`/api/v1/profiles/${params.id}`);
    const profile = (await req.json()) as ProfileHydrated

    return {
        profile
    }

}) satisfies PageServerLoad;