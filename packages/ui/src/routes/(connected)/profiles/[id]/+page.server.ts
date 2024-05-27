import type { PageServerLoad } from "./$types";
import type { ProfileHydrated } from "@metalizzsas/nuster-turbine/types/hydrated";

import { env } from "$env/dynamic/private";
import { fail, redirect } from '@sveltejs/kit';

export const load = (async ({ fetch, params }) => {

    const req = await fetch(`http://${env.TURBINE_ADDRESS}/v1/profiles/${params.id}`);
    const profile = (await req.json()) as ProfileHydrated

    return {
        profile
    }

}) satisfies PageServerLoad;

export const actions = {

    saveProfile: async ({ fetch, request }) => {

        const form = await request.formData();

        const profile = form.get("profile")?.toString();

        const profileId = form.get("profile_id")?.toString();

        if(profile === undefined || profileId === undefined)
            return fail(400, { saveProfile: { error: "Missing profile id or profile body" }});

        const profileSaveRequest = await fetch(`http://${env.TURBINE_ADDRESS}/v1/profiles/${profileId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: profile
        });

        if(profileSaveRequest.status !== 200 || !profileSaveRequest.ok)
            return fail(400, { saveProfile: { error: "Failed to save profile" }});

        return { saveProfile: { success: true }}

    },

    copyProfile: async ({ fetch, request }) => {

        const form = await request.formData();

        const profileId = form.get("profile_id")?.toString();
        const profile = form.get("profile")?.toString();

        if(profileId === undefined || profile === undefined)
            return fail(400, { copyProfile: { error: "Missing profile id or copied profile body" }});

        const profileCopyRequest = await fetch(`http://${env.TURBINE_ADDRESS}/v1/profiles/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: profile
        });

        if(profileCopyRequest.status !== 200 || !profileCopyRequest.ok)
            return fail(400, { copyProfile: { error: "Failed to copy profile" }});

        const copiedProfileBody = await profileCopyRequest.json() as ProfileHydrated;

        return redirect(302, `/profiles/${copiedProfileBody.id}`)

    },

    deleteProfile: async ({ fetch, request }) => {

        const form = await request.formData();

        const profileId = form.get("profile_id")?.toString();

        if(profileId === undefined)
            return fail(400, { deleteProfile: { error: "Missing profile id" }});

        const profileDeleteRequest = await fetch(`http://${env.TURBINE_ADDRESS}/v1/profiles/${profileId}`, {
            method: "DELETE"
        });

        if(profileDeleteRequest.status !== 200 || !profileDeleteRequest.ok)
            return fail(400, { deleteProfile: { error: "Failed to delete profile" }});

        return redirect(302, "/profiles")
    }
}