import { Machine } from "../classes/Machine";
import { Slot } from "../models/Slot";
import { Controller } from "./Controller";

import { Request, Response } from "express";

import fs from "fs";
import path from "path";

export class SlotController extends Controller
{
    private machine: Machine

    private slots: Slot[] = []

    constructor(machine: Machine)
    {
        super()

        this.machine = machine;

        this._configureRouter();
        this._configure();
    }

    private _configure()
    {
        for(let slot of this.machine.specs.slots)
        {
            this.slots.push(new Slot(slot.name, slot.type, slot.isProductable, slot.sensors))
        }
    }

    private _configureRouter()
    {
        /**
         * List all avalables slots fo this machine
         */
        this._router.get('/', async (req: Request, res: Response) => {

            for(let slot of this.slots)
            {
                await slot.readSensors();
            }

            res.json(this.slots);
        });

        /** 
         * Load a product into this slot
         */
        this._router.post('/:name', async (req: Request, res: Response) => {

            let targetSlot = this.slots.findIndex((slot) => slot.name == req.params.name)

            if(targetSlot > -1)
            {
                let result = await this.slots[targetSlot].loadSlot(req.body);

                res.status(result ? 200 : 400).end();
                return;
            }
            else
            {
                res.status(404).end();
                return;
            }
        });

        this._router.delete('/:name', async (req: Request, res: Response) => {

            let targetSlot = this.slots.findIndex((slot) => slot.name == req.params.name);

            if(targetSlot > -1)
            {
                let result = await this.slots[targetSlot].unloadSlot();

                res.status(result ? 200 : 400).end();
                return;
            }
            else
            {
                res.status(404).end();
                return;
            }
        });
    }
}