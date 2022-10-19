import type { ISlotHydrated } from "@metalizzsas/nuster-typings/build/hydrated/slot";
import type { IConfigSlot } from "@metalizzsas/nuster-typings/build/spec/slot";
import type { EProductSeries } from "@metalizzsas/nuster-typings/build/spec/slot/products";
import type { Request, Response } from "express";

import { Controller } from "../Controller";
import { Slot } from "./Slot";

export class SlotController extends Controller
{
    slots: Slot[] = [];

    private static _instance: SlotController;

    constructor(slots: IConfigSlot[])
    {
        super();

        this._configureRouter();

        for(const slot of slots)
        {
            this.slots.push(new Slot(slot));
        }
    }

    static getInstance(slots?: IConfigSlot[])
    {
        if(!this._instance)
            if(slots !== undefined)
                this._instance = new SlotController(slots);
            else
                throw new Error("SlotsController: Failed to instantiate, missing data");
        
        return this._instance;
    }

    private _configureRouter()
    {
        /**
         * List all avalables slots fo this machine
         */
        this._router.get('/', async (req: Request, res: Response) => {
            res.json(await this.socketData());
        });

        this.router.post("/:slot/load/:series", async (req: Request, res: Response) => {
            const slot = this.slots.find(s => s.name == req.params.slot);

            if(slot)
            {
                await slot.loadSlot(req.params.series as EProductSeries);
                res.end("ok");
            }
            else
            {
                res.status(404).end("slot not found");
            }
        });

        this.router.post("/:slot/unload/", async (req: Request, res: Response) => {
            const slot = this.slots.find(s => s.name == req.params.slot);

            if(slot)
            {
                await slot.unloadSlot();
                res.end("ok");
            }
            else
            {
                res.status(404).end("slot not found");
            }
        });

        this.router.post("/:slot/regulation/:sensor/state/:state", (req: Request, res: Response) => {
            req.params.sensor = req.params.sensor.replace("_", "#");
            const slot = this.slots.find(s => s.name == req.params.slot);
            const result = slot?.sensors?.find(ss => ss.io = req.params.sensor)?.regulationSetState(req.params.state == 'true' ? true : false);

            res.status(result === true ? 200 : 404).end();
        });

        this.router.post("/:slot/regulation/:sensor/target/:target", (req: Request, res: Response) => {
            req.params.sensor = req.params.sensor.replace("_", "#");
            const slot = this.slots.find(s => s.name == req.params.slot);
            const result = slot?.sensors?.find(ss => ss.io = req.params.sensor)?.regulationSetTarget(parseInt(req.params.target));

            res.status(result !== undefined ? 200 : 404).end();
        });
    }
    async socketData(): Promise<ISlotHydrated[]>
    {
        const data: ISlotHydrated[] = [];
        
        for(const s of this.slots)
            data.push(await s.socketData());

        return data;
    }
}