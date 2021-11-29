import { Machine } from "../classes/Machine";
import { Controller } from "./Controller";
import { ManualMode } from "../classes/ManualMode";

import { Request, Response } from "express";

import fs from "fs";
import path from "path";

export class ManualModeController extends Controller
{
    private machine: Machine

    private keys: ManualMode[] = []

    constructor(machine: Machine)
    {
        super();
        this.machine = machine;

        this._configure();
        this._configureRouter();

    }

    private async _configure()
    {
        let raw = fs.readFileSync(path.resolve("specs", this.machine.model, this.machine.variant, this.machine.revision + ".json"), {encoding: "utf-8"});
        let json = JSON.parse(raw).manual;

        for(let manual of json)
        {
            this.keys.push(new ManualMode(manual.name, manual.controls, manual.incompatibility))
        }
    }

    private _configureRouter()
    {
        this._router.get('/', async (req: Request, res: Response) => {
            res.json(this.keys);
        });

        //TODO: Ehance performance
        this.router.post('/:name/:value', async (req: Request, res: Response) => {
            let concernedKeyIndex = this.keys.findIndex((k) => k.name == req.params.name);

            if(concernedKeyIndex > -1)
            {
                //verify that triggering this will not interfer with other manual modes
                for(let k_incompatibilities of this.keys[concernedKeyIndex].incompatibility)
                {
                    let keyToCheck = this.keys.findIndex((k2) => k2.name == k_incompatibilities);

                    if(keyToCheck > -1)
                    {
                        if(this.keys[keyToCheck].state == true)
                        {
                            res.status(403).end();
                            return;
                        }
                    }
                    else
                    {
                        //incompatibility is not checkable
                        res.status(500).end();
                        return;
                    }
                }

                //check of incompatibilities is successful toggle the io now
                for(let gate of this.keys[concernedKeyIndex].controls)
                {
                    let activeGates: string[] = [];

                    for(let activeKeys of this.keys.filter((m => m.state == true && m.name != req.params.name)))
                    {
                        activeGates.push(...activeKeys.controls);
                    }

                    let activeGatesSet = [...new Set(activeGates)]

                    let gateIndex = this.machine.ioController!.gates.findIndex((g) => g.name == gate)

                    if(gateIndex > -1)
                    {
                        //skip this gate updating routine because it is enabled in another manual mode
                        if(!(activeGatesSet.findIndex((g) => g == gate) > -1))
                            this.machine.ioController!.gates[gateIndex].toggle(req.params.value == "true" ? 1 : 0)

                        this.keys[concernedKeyIndex].state = (req.params.value == "true");
                    }
                    else
                    {
                        //gate controls are wrongly defined
                        res.status(500).end();
                        return;
                    }
                }

                res.status(200).end();
                return;
            }
            else
            {
                //the manual key is undefined
                res.status(404).end();
                return;
            }
        });
    }
}