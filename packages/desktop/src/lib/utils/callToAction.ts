import type { CallToAction } from "@metalizzsas/nuster-typings/build/spec/nuster";
import { goto } from "$app/navigation";

/**
 * Execute a call to action.
 * @param ip Ip of the machine to execute the call to action on.
 * @param cta Call to action to execute
 * @returns Returns a goto promise
 */
export async function executeCallToAction(ip: string, cta: CallToAction): Promise<ReturnType<typeof goto> | undefined>
{
    if(cta.APIEndpoint)
    {
        const ctaRequest = await fetch(`${ip}${cta.APIEndpoint.url}`,{ 
            method: cta.APIEndpoint.method, 
            headers: { 'content-type': 'application/json'}, 
            body: (cta.APIEndpoint.body) ? JSON.stringify(cta.APIEndpoint.body) : undefined
        });

        if(ctaRequest.ok === false || ctaRequest.status !== 200)  return;
    }

    if(cta.UIEndpoint)
        return goto(cta.UIEndpoint);

    return;
}

export const execCTA = executeCallToAction;