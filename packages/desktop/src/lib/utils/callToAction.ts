import type { ICallToAction } from "@metalizzsas/nuster-typings/build/spec/nuster/ICallToAction";

export const execCTA = async (ip: string, cta: ICallToAction): Promise<string | undefined> =>
{
    if (cta.APIEndpoint !== undefined) {
        const request = await fetch(`//${ip}${cta.APIEndpoint.url}`, {
            method: cta.APIEndpoint.method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: (cta.APIEndpoint.body) ? JSON.stringify(cta.APIEndpoint.body) : undefined
        });

        if (request.status !== 200) return;
    }
    return cta.UIEndpoint;
}