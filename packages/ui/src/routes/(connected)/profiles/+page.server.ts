import type { ProfileHydrated } from "$lib/api/types";

export const load = async ({ locals }) => {

    const { data } = await locals.api.GET("/v1/profiles/");
    const profiles = (data as ProfileHydrated[]).filter(p => p.skeleton === "default");

    return {
        profiles
    }

};
