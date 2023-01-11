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

        for(const container of containers)
        {
            this.containers.push(new Container(container));
        }
    }

    private _configureRouter()
    {
        /**
         * List all avalables containers fo this machine
         */
        this.router.get('/', async (req: Request, res: Response) => {
            res.json(await this.socketData());
        });

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

        this.router.post("/:container/regulation/:regulation/state/:state", async (req: Request, res: Response) => {

            const state = req.params.state == "true" ? true : false

            TurbineEventLoop.emit(`container.${req.params.container}.regulation.${req.params.regulation}.set_state`, {state, callback: (stateSet) => {
                res.status(state === stateSet ? 200 : 500).end();
            }});
        });

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