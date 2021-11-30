import { Machine } from "../classes/Machine";
import { Controller } from "./Controller";

import { Request, Response } from "express";

import fs from "fs";
import path from "path";
import { IProfile, ProfileModel } from "../models/Profile";
import { randomUUID } from "crypto";
import { Cycle } from "../classes/Cycle";
import { Metalfog2cycle } from "../classes/Metalfog2Cycle";

export class CycleController extends Controller{

    private machine: Machine;

    private supportedCycles: CycleTypes[] = [];

    private runKey?: string;

    private cycle?: Cycle

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
            if(this.cycle != null)
                res.json(this.cycle!).end();
            else
                res.status(404).end();
        });

        //Get a runkey 
        this._router.post("/:id", async (req: Request, res: Response) => {
            this.cycle = new Metalfog2cycle(await ProfileModel.findById(req.params.id) as IProfile);
            this.cycle.run();
            res.status(200).end();
        });
   }
   private _handleSocket(ws: WebSocket)
   {

   }
}

export enum CycleTypes{
    METALFOG_MAIN = "metalfog2_primary",
    METALFOG_FILLACT = "metalfog2_secondary"
}