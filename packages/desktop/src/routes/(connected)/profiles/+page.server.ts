import type { ProfileHydrated } from "@metalizzsas/nuster-turbine/types/hydrated";
import { env } from "$env/dynamic/private";

export const load = async ({ fetch }) => {

    const req = await fetch(`http://${env.TURBINE_ADDRESS}/v1/profiles`);
    const profiles = ((await req.json()) as Array<ProfileHydrated>).filter(p => p.skeleton === "default");

    return {
        profiles
    }

};