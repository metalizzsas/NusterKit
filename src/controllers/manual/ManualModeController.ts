import { Machine } from "../../Machine";
import { Controller } from "../Controller";
import { ManualMode } from "./ManualMode";

import { Request, Response } from "express";

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
        for(const manual of this.machine.specs.manual)
        {
            this.keys.push(new ManualMode(manual.name, manual.controls, manual.incompatibility))
        }
    }

    private _configureRouter()
    {
        this._router.get('/', async (req: Request, res: Response) => {
            res.json(this.keys);
        });

        this.machine.authManager.registerEndpointPermission("manual.list", {endpoint: "/v1/manual/", method: "get"});

        //TODO: Ehance performance
        this.router.post('/:name/:value', async (req: Request, res: Response) => {
            const concernedKeyIndex = this.keys.findIndex((k) => k.name == req.params.name);

            if(concernedKeyIndex > -1)
            {
                //verify that triggering this will not interfer with other manual modes
                for(const k_incompatibilities of this.keys[concernedKeyIndex].incompatibility)
                {
                    const keyToCheck = this.keys.findIndex((k2) => k2.name == k_incompatibilities);

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
                for(const gate of this.keys[concernedKeyIndex].controls)
                {
                    const activeGates: string[] = [];

                    for(const activeKeys of this.keys.filter((m => m.state == true && m.name != req.params.name)))
                    {
                        activeGates.push(...activeKeys.controls);
                    }

                    const activeGatesSet = [...new Set(activeGates)]

                    const gateIndex = this.machine.ioController.gates.findIndex((g) => g.name == gate)

                    if(gateIndex > -1)
                    {
                        //skip this gate updating routine because it is enabled in another manual mode
                        if(!(activeGatesSet.findIndex((g) => g == gate) > -1))
                            this.machine.ioController.gates[gateIndex].write(this.machine.ioController, req.params.value == "true" ? 1 : 0)

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

        this.machine.authManager.registerEndpointPermission("manual.toggle", {endpoint: new RegExp("/v1/manual/.*/.*", "g"), method: "post"});
    }
}