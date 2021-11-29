import { Machine } from "../classes/Machine";
import { Controller } from "./Controller";

import { Request, Response } from "express";

import fs from "fs";
import path from "path";
import { IProfile, ProfileModel } from "../models/Profile";
import { randomUUID } from "crypto";

export class CycleController extends Controller{

    private machine: Machine;

    private supportedCycles: CycleTypes[] = [];

    private runKey?: string;

   constructor(machine: Machine)
   {
       super();
       this.machine = machine;

       this._configure();
       this._configureRouter();
   } 

   private _configure()
   {
        for(let cycle of this.machine.specs.cycle)
        {
            this.supportedCycles.push(cycle as CycleTypes);
        }
   }

   private _configureRouter()
   {
       //list all supported cycles types by this machine
        this._router.get("/", (req: Request, res: Response) => {
            res.json(this.supportedCycles);
        });

        //Get a runkey 
        this._router.post("/:cycle/:id", async (req: Request, res: Response) => {

            if(this.supportedCycles.findIndex((s) => s == req.params.cycle) > -1)
            {
                let profile = ProfileModel.findById(req.params.id);

                if(profile != undefined)
                {
                    console.log(profile);
    
                    this.runKey = randomUUID();
    
                    //Profile found, cycle authorized
                    //a runKey is distributed
                    res.json({"runKey": this.runKey});
                    return;
                }
                else
                {
                    //profile has not been found
                    res.status(404).end();
                    return;
                }
            }
            else
            {
                //Cycle used is not authorized in current context
                res.status(403).end();
                return;
            }
        });

        this._router.put("/:runKey", async (req: Request, res: Response) => {

        });
   }
   private _handleSocket(ws: WebSocket)
   {

   }
}

export enum CycleTypes{
    METALFOG_MAIN = "metalfog_main",
    METALFOG_FILLACT = "metalfog_secondary"
}