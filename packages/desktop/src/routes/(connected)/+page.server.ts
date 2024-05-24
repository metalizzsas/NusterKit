import type { ProfileHydrated } from "@metalizzsas/nuster-turbine/types/hydrated";
import type { CyclePremade } from "@metalizzsas/nuster-turbine/types/spec/cycle";
import type { PageServerLoad } from "./$types";
import { env } from "$env/dynamic/private";

export const load = (async ({ fetch }) => {

    let cyclePremades: Array<Omit<CyclePremade, "profile"> & { profile?: ProfileHydrated}> = [];

    const req = await fetch(`http://${env.TURBINE_ADDRESS}/v1/cycle/premades`);
    let premades = await req.json() as Array<CyclePremade>;

    const reqProfiles = await fetch(`http://${env.TURBINE_ADDRESS}/v1/profiles/`);
    const profileList = await reqProfiles.json() as Array<ProfileHydrated>;

    premades = [...profileList.filter(k => k.isPremade === false).map(k => { return { cycle: "default", profile: k.id, name: "user" } as CyclePremade}), ...premades];

    cyclePremades = premades.map(k => { 
        return {
            ...k,
            profile: profileList.find(p => p.id === k.profile)
        }
    });

    return {
        cyclePremades
    };

}) satisfies PageServerLoad;