import { Machine } from "../../Machine";
import { Controller } from "../Controller";

import { Request, Response } from "express";

import { IProfile, ProfileModel } from "../profile/Profile";
import { Cycle, CycleMode } from "./Cycle";
import { CycleHistoryModel } from "./CycleHistory";

export class CycleController extends Controller{

    private machine: Machine;

    private supportedCycles: string[] = [];

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
            this.supportedCycles.push(cycle.name);
        }
   }

   private _configureRouter()
   {
       //list all supported cycles types by this machine
        this._router.get("/", (_req: Request, res: Response) => {
            res.json(this.supportedCycles);
        });

        //prepare the cycle
        this._router.post("/:name/:id?", async (req: Request, res: Response) => {

            let profile = (req.params.id) ? undefined : await ProfileModel.findById(req.params.id) as IProfile;
            
            this.cycle = new Cycle(this.machine, req.params.name, profile);

            if(this.cycle.program.profileIdentifier != profile?.identifier)
            {
                this.cycle = undefined;
                res.status(403).write("Profile is not compatible with this cycle");
                return;
            }

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