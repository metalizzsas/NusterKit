import type { ProfileHydrated, CycleType } from "$lib/api/types";
import type { Actions } from "./$types";
import { fail, redirect } from "@sveltejs/kit";

export const load = async ({ locals }) => {

    const { data: typesData } = await locals.api.GET("/v1/cycle/types");
    const cycleTypes = (typesData ?? []) as Array<CycleType>;

    const { data: profileData } = await locals.api.GET("/v1/profiles/");
    const profileList = (profileData ?? []) as Array<ProfileHydrated>;

    // Each cycle type carries its compatible profiles (matching skeleton),
    // premade profiles first, then user profiles by latest modification.
    const cycleStartOptions = cycleTypes.map((t) => ({
        ...t,
        profiles: profileList
            .filter((p) => p.skeleton === t.name)
            .sort((a, b) => {
                if (a.isPremade !== b.isPremade) return a.isPremade ? -1 : 1;
                return new Date(b.modificationDate ?? 0).getTime() - new Date(a.modificationDate ?? 0).getTime();
            }),
    }));

    return {
        cycleStartOptions
    };

};

export const actions: Actions = {

    /** Prepare a cycle */
    prepareCycle: async ({ locals, request }) => {

        const form = await request.formData();

        const cycleType = form.get('cycle_type')?.toString();
        const profileId = form.get('profile_id')?.toString();

        if(locals.machine_status.cycle !== undefined)
        {
            const { error } = await locals.api.PATCH("/v1/cycle/");
            if(error)
            {
                return fail(403, { prepareCycle: { error: "Failed to prepare cycle due to a present cycle we cant patch" }});
            }
        }

        const { error } = await locals.api.POST("/v1/cycle/{name}/{id}?", {
            params: { path: { name: cycleType!, id: profileId ?? '' } },
            body: null,
        });

        if(error)
        {
            return fail(403, { prepareCycle: { error: "Failed to prepare cycle" }});
        }

        return { prepareCycle: { success: true }};
    },

    /** Clear a running cycle gracefully */
    patchCycle: async ({ locals }) => {

        const { error } = await locals.api.PATCH("/v1/cycle/");
        if(error)
        {
            return fail(403, { patchCycle: { error: "Failed to patch cycle" }});
        }

        return { patchCycle: { success: true }};
    },

    /** Start cycle */
    startCycle: async ({ locals }) => {

        const { error } = await locals.api.POST("/v1/cycle/");
        if(error)
        {
            return fail(403, { startCycle: { error: "Failed to start cycle" }});
        }

        return { startCycle: { success: true }};
    },

    /** Pause cycle */
    pauseCycle: async ({ locals }) => {

        const { error } = await locals.api.PUT("/v1/cycle/pause");
        if(error)
        {
            return fail(403, { pauseCycle: { error: "Failed to pause cycle" }});
        }

        return { pauseCycle: { success: true }};

    },

    /** Take cycle to the next step */
    nextStepCycle: async ({ locals }) => {

        const { error } = await locals.api.PUT("/v1/cycle/");
        if(error)
        {
            return fail(403, { nextStepCycle: { error: "Failed to move to next step" }});
        }

        return { nextStepCycle: { success: true }};

    },

    /** Ends cycle */
    stopCycle: async ({ locals }) => {

        const { error } = await locals.api.DELETE("/v1/cycle/");
        if(error)
        {
            return fail(403, { stopCycle: { error: "Failed to stop cycle" }});
        }

        return { stopCycle: { success: true }};
    },

    /** Execute a call to action, this is unsafe, should be moved to turbine as endpoints should not be exposed like this. */
    callToAction: async ({ request, locals }) => {

        const form = await request.formData();

        const callToActionId = form.get('cta_id')?.toString();
        const { data, error } = await locals.api.GET("/v1/calltoaction/{id}", {
            params: { path: { id: callToActionId! } }
        });

        if(error) return fail(500, { callToAction: { error: "Failed to execute call to action" }});

        const UIEndpoint = data as string;

        if(UIEndpoint.length > 0)
            return redirect(302, UIEndpoint);

    }
}
