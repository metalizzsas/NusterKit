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

        this.router.post('/:name/:value', async (req: Request, res: Response) => {

            const key = this.keys.find(k => k.name === req.params.name);

            //find manual mode to update
            if(key)
            {
                const value = req.params.value === "true" ? true : false;
                
                //Key is going to be enabled, so check if it is compatible with other keys
                if(value)
                {
                    //check if one of the key to toggle ON is compatible to already active keys
                    if(this.keys.filter(k => k.state).find(k => k.incompatibility.includes(key.name)))
                    {
                        res.status(403).send("incompatibility detected");
                        return;
                    }
                    else
                    {
                        //key is ready to be toggled
                        //toggle gates but not if they are already active

                        const activeGates = this.keys.filter(k => k.state).flatMap(k => k.controls);

                        const gatesToToggle = key.controls.filter(g => !activeGates.includes(g));

                        for(const gate of gatesToToggle)
                        {
                            await this.machine.ioController.gFinder(gate)?.write(this.machine.ioController, 1);
                        }

                        key.state = true;

                        res.status(200).send("ok");
                    }
                }
                else
                {
                    //manual mode is going to be disabled, set concerned gates to false
                    const activeGatesThatStay = this.keys.filter(k => k.state && k.name !== key.name).flatMap(k => k.controls);

                    const gatesToToggleOff = key.controls.filter(g => !activeGatesThatStay.includes(g));

                    for(const gate of gatesToToggleOff)
                        await this.machine.ioController.gFinder(gate)?.write(this.machine.ioController, 0);

                    key.state = false;
                    
                    res.status(200).send("ok");
                }
            }
            else
            {
                res.status(404).send("manual mode not found");
                return;
            }
        });

        this.machine.authManager.registerEndpointPermission("manual.toggle", {endpoint: new RegExp("/v1/manual/.*/.*", "g"), method: "post"});
    }

    public get socketData()
    {
        return this.keys;
    }
}