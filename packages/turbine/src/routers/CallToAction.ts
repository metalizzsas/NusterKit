/* eslint-disable camelcase */

import type { CallToAction, CallToActionFront } from "$types/spec/nuster";
import { prisma } from "../db";
import { Router } from "./Router";

export class CalltoActionRouter extends Router
{

    constructor()
    {
        super();
        this.clearCallToActions();
    }

    /**
     * Generate a call to action instance
     * @param cta Call to action to be executed
     * @returns Call to action id to be called later
     */
    static async generateCallToAction(cta: CallToAction): Promise<CallToActionFront> {

        const { id } = await prisma.callToAction.create({
            data: {
                api_endpoint: cta.APIEndpoint?.url,
                api_method: cta.APIEndpoint?.method,
                api_body: cta.APIEndpoint?.body as string,
    
                ui_endpoint: cta.UIEndpoint,
            
            }
        });
        
        return { name: cta.name, id };
    }
    
    /** Clear all old call to actions */
    async clearCallToActions(): Promise<void> {
        await prisma.callToAction.deleteMany({});
    }
}