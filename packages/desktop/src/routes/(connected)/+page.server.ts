import type { CyclePremade } from "@metalizzsas/nuster-typings/build/spec/cycle";
import type { ProfileHydrated } from "@metalizzsas/nuster-typings/build/hydrated";
import type { PageServerLoad } from "./$types";

export const load = (async ({ fetch }) => {

    let cyclePremades: Array<Omit<CyclePremade, "profile"> & { profile?: ProfileHydrated}> = [];

    const req = await fetch(`/api/v1/cycle/premades`);
    let premades = await req.json() as Array<CyclePremade>;

    const reqProfiles = await fetch(`/api/v1/profiles/`);
    const profileList = await reqProfiles.json() as Array<ProfileHydrated>;

    premades = [...profileList.filter(k => k.isPremade === undefined).map(k => { return { cycle: "default", profile: k._id, name: "user" } as CyclePremade}), ...premades];

    cyclePremades = premades.map(k => { 
        return {
            ...k,
            profile: profileList.find(p => p._id === k.profile)
        }
    });

    return {
        cyclePremades
    };

}) satisfies PageServerLoad;