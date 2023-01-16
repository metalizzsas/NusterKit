import type { ProfileHydrated } from "@metalizzsas/nuster-typings/build/hydrated";
import type { PageServerLoad } from "./$types";

export const load = (async ({ fetch }) => {

    const req = await fetch(`/api/v1/profiles`);
    const profiles = ((await req.json()) as Array<ProfileHydrated>).filter(p => p.skeleton === "default");

    return {
        profiles
    }

}) satisfies PageServerLoad;