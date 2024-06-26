import type { CallToAction } from "@nuster/turbine/types/spec/nuster";
import { goto } from "$app/navigation";

/**
 * Execute a call to action.
 * @param ip Ip of the machine to execute the call to action on.
 * @param cta Call to action to execute
 * @returns Returns a goto promise
 */
export async function executeCallToAction(cta: CallToAction): Promise<ReturnType<typeof goto> | undefined>
{
    if(cta.APIEndpoint)
    {
        const ctaRequest = await fetch(`${cta.APIEndpoint.url}`, { 
            method: cta.APIEndpoint.method, 
            headers: { 'content-type': 'application/json' }, 
            body: (cta.APIEndpoint.body) ? JSON.stringify(cta.APIEndpoint.body) : undefined
        });

        if(ctaRequest.ok === false || ctaRequest.status !== 200)  return;
    }

    if(cta.UIEndpoint)
        return goto(cta.UIEndpoint);

    return;
}