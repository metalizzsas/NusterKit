import { Machine } from "../../Machine";
import { Controller } from "../Controller";

import { Request, Response } from "express";

import { IProfile, ProfileModel } from "../profile/Profile";
import { Cycle, CycleMode } from "./Cycle";
import { Metalfog2cycle } from "./Metalfog2Cycle";
import { CycleHistoryModel } from "./CycleHistory";

export class CycleController extends Controller{

    private machine: Machine;

    private supportedCycles: CycleTypes[] = [];

    private runKey?: string;

    private cycle?: Cycle

    private wsClients: WebSocket[] = [];

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

        //prepare the cycle
        this._router.post("/:id", async (req: Request, res: Response) => {
            this.cycle = new Metalfog2cycle(await ProfileModel.findById(req.params.id) as IProfile);
            
            res.status(200).end();
        });

        //start the cycle
        this._router.put("/", async (req: Request, res: Response) => {
            if(this.cycle !== undefined)
            {
                this.cycle.run();
                res.status(200).end();
            }
            else
            {
                res.status(404).end();
            }
        });

        //rate the cycle and remove it
        this._router.patch("/:rating", async (req: Request, res: Response) => {
            if(this.cycle !== undefined)
            {
                if(this.cycle!.status.mode != CycleMode.ENDED || CycleMode.STOPPED)
                {
                    await CycleHistoryModel.create({
                        rating: parseInt(req.params.rating) || 0,
                        cycle: this.cycle
                    });
                    this.cycle == undefined;
                }
                else
                {
                    res.status(403).write("Can't rate a cycle that has not ended");
                }
            }
            else
            {
                //cycle is not defined
                res.status(404).write("Can't rate a non existing cycle");

            }
        });

        //stops the cycle
        this._router.delete("/", async (req: Request, res: Response) => {
            if(this.cycle !== undefined)
            {
                await this.cycle.stop();  
                res.status(200).end(); 
            }
            else
            {
                res.status(404).end();
            }
        });
   }

   public get socketData()
   {
        return this.cycle;
   }
}

export enum CycleTypes{
    METALFOG_MAIN = "metalfog2_primary",
    METALFOG_FILLACT = "metalfog2_secondary"
}
