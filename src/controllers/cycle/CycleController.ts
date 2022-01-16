import { Machine } from "../../Machine";
import { Controller } from "../Controller";

import { Request, Response } from "express";

import { IProfile, ProfileModel } from "../profile/Profile";
import { ProgramHistoryModel } from "./ProgramHistory";
import { PBRMode, ProgramBlockRunner } from "../../programblocks/ProgramBlockRunner";

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

        this.machine.authManager.registerEndpointPermission("cycle.list", {endpoint: "/v1/cycle/", method: "get"});

        //restart cycle, put it there beacause it conflicts with the POST /:name/:id? route
        this._router.post("/restart/:history_id", async (req: Request, res: Response) => {

            const history = await ProgramHistoryModel.findById(req.params.history_id);

            if(history)
            {
                this.machine.logger.info("PBR assigned for restart");

                this.program = new ProgramBlockRunner(this.machine, history.profile, history.cycle);

                if(this.program.name != history.profile.identifier)
                {
                    res.status(403);
                    res.write(`Profile ${this.program.name} is not compatible with cycle profile ${history.profile.identifier}`);
                    res.end();
                    this.program = undefined;
                    return;
                }
                else
                {
                    res.status(200)
                    res.write("ok");
                    res.end();
                    return;
                }
            }
            else
            {
                res.status(404).write("HistoryPoint not found");
                return;
            }
        });

        this.machine.authManager.registerEndpointPermission("cycle.run", {endpoint: new RegExp("/v1/cycle/restart/.*", "g"), method: "post"});

        //prepare the cycle
        this._router.post("/:name/:id?", async (req: Request, res: Response) => {

            const profile = (!req.params.id) ? undefined : await ProfileModel.findById(req.params.id) as IProfile;

            if(profile)
            {
                const cycle = this.machine.specs.cycles.find((ip) => ip.name == req.params.name);

                if(cycle)
                {
                    this.machine.logger.info("PBR assigned");
                    this.program = new ProgramBlockRunner(this.machine, profile, cycle);

                    if(this.program.name != profile.identifier)
                    {
                        res.status(403);
                        res.write(`Profile ${this.program.name} is not compatible with cycle profile ${profile.identifier}`);
                        res.end();
                        this.program = undefined;
                        return;
                    }
                    else
                    {
                        res.status(200)
                        res.write("ok");
                        res.end();
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
        });

        this.machine.authManager.registerEndpointPermission("cycle.run", {endpoint: new RegExp("/v1/cycle/.*", "g"), method: "post"});

        //start the cycle
        this._router.put("/", async (req: Request, res: Response) => {
            if(this.program !== undefined)
            {
                this.program.run();
                res.status(200);
                res.end();
            }
            else
            {
                res.status(404);
                res.end();
            }
        });

        this.machine.authManager.registerEndpointPermission("cycle.run", {endpoint: "/v1/cycle/", method: "put"});

        //rate the cycle and remove it
        this._router.patch("/:rating", async (req: Request, res: Response) => {
            if(this.program)
            {
                if(this.program.status.mode == PBRMode.ENDED || PBRMode.STOPPED || PBRMode.CREATED)
                {
                    //do not save the history if the program was just created and never started
                    if(this.program.status.mode != PBRMode.CREATED)
                    {
                        await ProgramHistoryModel.create({
                            rating: parseInt(req.params.rating) || 0,
                            cycle: this.program,
                            profile: this.program.profile
                        });
                    }
                    
                    this.program = undefined;

                    res.status(200);
                    res.write("ok");
                    res.end();
                }
                else
                {
                    res.status(403);
                    res.write("Can't rate a cycle that has not ended");
                    res.end();
                }
            }
            else
            {
                //cycle is not defined
                res.status(404);
                res.write("Can't rate a non existing cycle");
                res.end();
            }
        });

        this.machine.authManager.registerEndpointPermission("cycle.run", {endpoint: "/v1/cycle/.*", method: "patch"});

        //stops the cycle
        this._router.delete("/", async (req: Request, res: Response) => {
            if(this.program !== undefined)
            {
                await this.program.end("user");  
                res.status(200);
                res.end(); 
            }
            else
            {
                res.status(404);
                res.end();
            }
        });

        this.machine.authManager.registerEndpointPermission("cycle.run", {endpoint: "/v1/cycle/", method: "delete"});
   }

   public get socketData()
   {
        return this.program;
   }
}