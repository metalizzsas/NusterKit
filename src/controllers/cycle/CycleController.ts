import { Machine } from "../../Machine";
import { Controller } from "../Controller";

import { Request, Response } from "express";

import { IProfile, ProfileModel } from "../profile/Profile";
import { CycleMode } from "./Cycle";
import { CycleHistoryModel } from "./CycleHistory";
import { ProgramBlockRunner } from "../../programblocks/ProgramBlockRunner";

export class CycleController extends Controller{

    private machine: Machine;

    private supportedCycles: string[] = [];
    private program?: ProgramBlockRunner

   constructor(machine: Machine)
   {
       super();
       this.machine = machine;

       this._configure();
       this._configureRouter();
   } 

   private _configure()
   {
        for(const cycle of this.machine.specs.cycles)
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

            const profile = (req.params.id) ? undefined : await ProfileModel.findById(req.params.id) as IProfile;

            if(profile)
            {
                const cycle = this.machine.specs.cycles.find((ip) => ip.name == req.params.name);

                if(cycle)
                {
                    this.program = new ProgramBlockRunner(this.machine, profile, cycle);

                    if(this.program.profileIdentifier != profile.identifier)
                    {
                        res.status(403).write("Profile is not compatible with this cycle");
                        this.program = undefined;
                        return;
                    }
                }
                else
                {
                    res.status(404).write("Cycle not found");
                    return;
                }
            }
            else
            {
                res.status(404).write("Profile not found");
                return;
            }

            res.status(200).end();
        });

        //start the cycle
        this._router.put("/", async (req: Request, res: Response) => {
            if(this.program !== undefined)
            {
                this.program.run();
                res.status(200).end();
            }
            else
            {
                res.status(404).end();
            }
        });

        //rate the cycle and remove it
        this._router.patch("/:rating", async (req: Request, res: Response) => {
            if(this.program)
            {
                if(this.program.status.mode != CycleMode.ENDED || CycleMode.STOPPED)
                {
                    await CycleHistoryModel.create({
                        rating: parseInt(req.params.rating) || 0,
                        cycle: this.program
                    });
                    this.program == undefined;
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
            if(this.program !== undefined)
            {
                await this.program.stop();  
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
        return this.program;
   }
}