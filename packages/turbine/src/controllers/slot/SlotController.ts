import { ISlotHydrated } from "@metalizzsas/nuster-typings/src/hydrated/slot";
import { IConfigSlot } from "@metalizzsas/nuster-typings/src/spec/slot";
import { Request, Response } from "express";

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

        this.router.post("/:slot/load", async (req: Request, res: Response) => {
            const slot = this.slots.find(s => s.name == req.params.slot);

            if(slot)
            {
                await slot.loadSlot();
                res.end("ok");
            }
            else
            {
                res.status(404).end("slot not found");
            }
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