import type { ProfileHydrated } from "@nuster/turbine/types/hydrated";
import type { CyclePremade } from "@nuster/turbine/types/spec/cycle";
import type { Actions } from "./$types";
import { env } from "$env/dynamic/private";
import { fail, redirect } from "@sveltejs/kit";

export const load = async ({ fetch }) => {

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

};

export const actions: Actions = {

    /** Prepare a cycle */
    prepareCycle: async ({ locals, request, fetch }) => {

        const form = await request.formData();

        const cycleType = form.get('cycle_type')?.toString();
        const profileId = form.get('profile_id')?.toString();

        if(locals.machine_status.cycle !== undefined)
        {
            const patchRequest = await fetch(`http://${env.TURBINE_ADDRESS}/v1/cycle`, { method: 'PATCH' });
            if(patchRequest.status !== 200 || !patchRequest.ok)
            {
                return fail(403, { prepareCycle: { error: "Failed to prepare cycle due to a present cycle we cant patch" }});
            }
        }
        
        const prepareRequest = await fetch(`http://${env.TURBINE_ADDRESS}/v1/cycle/${cycleType}/${profileId ?? ''}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }});

        if(prepareRequest.status !== 200 || !prepareRequest.ok)
        {
            return fail(403, { prepareCycle: { error: "Failed to prepare cycle" }});
        }

        return { prepareCycle: { success: true }};
    },

    /** Clear a running cycle gracefully */
    patchCycle: async ({ fetch }) => {

        const patchRequest = await fetch(`http://${env.TURBINE_ADDRESS}/v1/cycle`, { method: 'PATCH' });
        if(patchRequest.status !== 200 || !patchRequest.ok)
        {
            return fail(403, { patchCycle: { error: "Failed to patch cycle" }});
        }

        return { patchCycle: { success: true }};
    },

    /** Start cycle */
    startCycle: async ({ fetch }) => {
            
        const startRequest = await fetch(`http://${env.TURBINE_ADDRESS}/v1/cycle`, { method: 'POST' });
        if(startRequest.status !== 200 || !startRequest.ok)
        {
            return fail(403, { startCycle: { error: "Failed to start cycle" }});
        }

        return { startCycle: { success: true }};
    },

    /** Pause cycle */
    pauseCycle: async ({ fetch }) => {

        const pauseRequest = await fetch(`http://${env.TURBINE_ADDRESS}/v1/cycle/pause`, { method: 'PUT' });
        if(pauseRequest.status !== 200 || !pauseRequest.ok)
        {
            return fail(403, { pauseCycle: { error: "Failed to pause cycle" }});
        }

        return { pauseCycle: { success: true }};

    },

    /** Take cycle to the next step */
    nextStepCycle: async ({ fetch }) => {
            
        const nextRequest = await fetch(`http://${env.TURBINE_ADDRESS}/v1/cycle`, { method: 'PUT' });
        if(nextRequest.status !== 200 || !nextRequest.ok)
        {
            return fail(403, { nextStepCycle: { error: "Failed to move to next step" }});
        }

        return { nextStepCycle: { success: true }};

    },

    /** Ends cycle */
    stopCycle: async ({ fetch }) => {
            
        const stopRequest = await fetch(`http://${env.TURBINE_ADDRESS}/v1/cycle`, { method: 'DELETE' });
        if(stopRequest.status !== 200 || !stopRequest.ok)
        {
            return fail(403, { stopCycle: { error: "Failed to stop cycle" }});
        }

        return { stopCycle: { success: true }};
    },

    /** Execute a call to action, this is unsafe, should be moved to turbine as endpoints should not be exposed like this. */
    callToAction: async ({ request, fetch }) => {

        const form = await request.formData();

        const callToActionId = form.get('cta_id')?.toString();
        const ctaRequest = await fetch(`http://${env.TURBINE_ADDRESS}/v1/calltoaction/${callToActionId}`);

        if(ctaRequest.ok === false || ctaRequest.status !== 200)  return fail(500, { callToAction: { error: "Failed to execute call to action" }});

        const UIEndpoint = await ctaRequest.text();

        if(UIEndpoint.length > 0)
            return redirect(302, UIEndpoint);

    }
}