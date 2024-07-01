/* eslint-disable camelcase */

import type { CallToAction, CallToActionFront } from "$types/spec/nuster";
import { prisma } from "../db";
import { Router } from "./Router";

export class CalltoActionRouter extends Router
{

    constructor()
    {
        super();
        this._configureRouter();
        this.clearCallToActions();
    }

    private _configureRouter() 
    {

        this.router.get("/:id", async (req, res) => {

            const cta = await prisma.callToAction.findUnique({
                where: {
                    id: req.params.id
                }
            });

            if(cta === null)
            {
                res.status(404).end();
                return;
            }

            if(cta.api_endpoint !== null && cta.api_method)
            {

                const ctaRequest = await fetch(`http://localhost:${process.env.PORT}${cta.api_endpoint}`, {
                    method: cta.api_method,
                    body: cta.api_body ?? undefined
                });

                if(!ctaRequest.ok || ctaRequest.status !== 200) {
                    res.status(500).end();
                    return;
                }
            }
            
            await prisma.callToAction.delete({ where: { id: req.params.id }});
            res.status(200).end(cta.ui_endpoint);
            
        });
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