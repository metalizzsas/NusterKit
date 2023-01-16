import type { Request, Response } from "express";

import type { ContainerHydrated } from "@metalizzsas/nuster-typings/build/hydrated/containers";
import type { Container as ContainerConfig } from "@metalizzsas/nuster-typings/build/spec/containers";
import type { ProductSeries } from "@metalizzsas/nuster-typings/build/spec/containers/products";
import { Container } from "../containers/Containers";
import { Router } from "./Router";
import { TurbineEventLoop } from "../events";

export class ContainersRouter extends Router
{
    containers: Container[] = [];

    constructor(containers: ContainerConfig[])
    {
        super();
        this._configureRouter();
        this.containers = containers.map(c => new Container(c));
    }

    private _configureRouter()
    {
        /** Route used to load a product inside the container */
        this.router.post("/:container/load/:series", async (req: Request, res: Response) => {
            const container = this.containers.find(s => s.name == req.params.container);

            if(container)
            {
                await container.loadProduct(req.params.series as ProductSeries);
                res.end("ok");
            }
            else
            {
                res.status(404).end("container not found");
            }
        });

        /** Route used to unload a product from a container */
        this.router.post("/:container/unload/", async (req: Request, res: Response) => {
            const container = this.containers.find(s => s.name == req.params.container);

            if(container)
            {
                await container.unloadProduct();
                res.end("ok");
            }
            else
            {
                res.status(404).end("container not found");
            }
        });

        /** Route used to set the state of a container's regulation */
        this.router.post("/:container/regulation/:regulation/state/:state", async (req: Request, res: Response) => {

            const state = req.params.state == "true" ? true : false

            TurbineEventLoop.emit(`container.${req.params.container}.regulation.${req.params.regulation}.set_state`, {state, callback: (stateSet) => {
                res.status(state === stateSet ? 200 : 500).end();
            }});
        });

        /** Route used to set the target of a container's regulation */
        this.router.post("/:container/regulation/:regulation/target/:target", async (req: Request, res: Response) => {

            const target = parseInt(req.params.target)

            TurbineEventLoop.emit(`container.${req.params.container}.regulation.${req.params.regulation}.set_target`, {target, callback: (targetSet) => {
                res.status(target === targetSet ? 200 : 500).end();
            }});
        });
    }
    
    async socketData(): Promise<ContainerHydrated[]>
    {
        return await Promise.all(this.containers.map(async k => await k.socketData()));
    }
}