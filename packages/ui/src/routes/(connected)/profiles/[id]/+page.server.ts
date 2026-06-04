import type { PageServerLoad } from "./$types";
import type { ProfileHydrated } from "$lib/api/types";

import { fail, redirect } from '@sveltejs/kit';

export const load = (async ({ locals, params }) => {

    const { data } = await locals.api.GET("/v1/profiles/{id}", {
        params: { path: { id: params.id } }
    });

    // Existing folders across all profiles, for the folder picker
    const { data: allProfiles } = await locals.api.GET("/v1/profiles/");
    const folders = [
        ...new Set(
            ((allProfiles ?? []) as ProfileHydrated[])
                .map((p) => p.folder)
                .filter((f): f is string => typeof f === "string" && f.length > 0),
        ),
    ].sort((a, b) => a.localeCompare(b));

    return {
        profile: data as ProfileHydrated,
        folders
    }

}) satisfies PageServerLoad;

export const actions = {

    saveProfile: async ({ locals, request }) => {

        const form = await request.formData();

        const profile = form.get("profile")?.toString();

        const profileId = form.get("profile_id")?.toString();

        if(profile === undefined || profileId === undefined)
            return fail(400, { saveProfile: { error: "Missing profile id or profile body" }});

        const { error } = await locals.api.PATCH("/v1/profiles/{id}", {
            params: { path: { id: profileId } },
            body: JSON.parse(profile),
        });

        if(error)
            return fail(400, { saveProfile: { error: "Failed to save profile" }});

        return { saveProfile: { success: true }}

    },

    copyProfile: async ({ locals, request }) => {

        const form = await request.formData();

        const profileId = form.get("profile_id")?.toString();
        const profile = form.get("profile")?.toString();

        if(profileId === undefined || profile === undefined)
            return fail(400, { copyProfile: { error: "Missing profile id or copied profile body" }});

        const { data, error } = await locals.api.POST("/v1/profiles/", {
            body: JSON.parse(profile),
        });

        if(error)
            return fail(400, { copyProfile: { error: "Failed to copy profile" }});

        const copiedProfile = data as ProfileHydrated;

        return redirect(302, `/profiles/${copiedProfile.id}`)

    },

    deleteProfile: async ({ locals, request }) => {

        const form = await request.formData();

        const profileId = form.get("profile_id")?.toString();

        if(profileId === undefined)
            return fail(400, { deleteProfile: { error: "Missing profile id" }});

        const { error } = await locals.api.DELETE("/v1/profiles/{id}", {
            params: { path: { id: profileId } }
        });

        if(error)
            return fail(400, { deleteProfile: { error: "Failed to delete profile" }});

        return redirect(302, "/profiles")
    }
}
