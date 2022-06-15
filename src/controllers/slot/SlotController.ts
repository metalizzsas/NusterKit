import { Machine } from "../../Machine";
import { Slot } from "./Slot";
import { Controller } from "../Controller";

import { Request, Response } from "express";

export class SlotController extends Controller
{
    private machine: Machine;
    slots: Slot[] = [];

    constructor(machine: Machine)
    {
        super();

        this.machine = machine;

        this._configureRouter();
        this._configure();
    }

    private _configure()
    {
        for(const slot of this.machine.specs.slots)
        {
            this.slots.push(new Slot(slot, this.machine.ioController));
        }
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
            const slot = this.machine.slotController.slots.find(s => s.name == req.params.slot);

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
    async socketData()
    {
        const data: any[] = [];
        for(const s of this.slots){
            data.push(await s.socketData());
        }
        return data;
    }
}