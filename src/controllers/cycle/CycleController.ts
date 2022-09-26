import { Machine } from "../../Machine";
import { Controller } from "../Controller";

import { Request, Response } from "express";

import { ProfileModel } from "../profile/ProfileModel";
import { ProgramHistoryModel } from "./ProgramHistoryModel";
import { ProgramBlockRunner } from "../../pbr/ProgramBlockRunner";
import { IProfile, IProfileExportable } from "../../interfaces/IProfile";
import { EPBRMode, IPBRPremades } from "../../interfaces/IProgramBlockRunner";
import { IProfileMap } from "../profile/ProfilesController";

export class CycleController extends Controller {

    private machine: Machine;

    private supportedCycles: { name: string, profileRequired: boolean }[] = [];
    private premadeCycles: IPBRPremades[] = [];
    public program?: ProgramBlockRunner

   constructor(machine: Machine)
   {
       super();
       this.machine = machine;

       this._configure();
       this._configureRouter();
   } 

   private _configure()
   {
        for(const cycle of this.machine.specs.cycleTypes)
        {
            this.supportedCycles.push({name: cycle.name, profileRequired: cycle.profileRequired});
        }
        for(const premade of this.machine.specs.cyclePremades)
        {
            //skip the premade if its masked on machine settings
            if(this.machine.settings?.maskedPremades?.includes(premade.name))
                this.machine.logger.info(`CycleController: Skipping premade cycle ${premade.name} because it is masked on machine settings.`);
            else
                this.premadeCycles.push({name: premade.name, profile: premade.profile, cycle: premade.cycle});
        }
   }

   private _configureRouter()
   {
        //list all supported cycles premades by this machine
        this._router.get("/premades", (_req: Request, res: Response) => {
           res.json(this.premadeCycles);
        });
        this.machine.authManager.registerEndpointPermission("cycle.list", {endpoint: "/v1/cycle/premades", method: "get"});
        
        //list all supported cycles types by this machine
        this._router.get("/custom", (_req: Request, res: Response) => {
            res.json(this.supportedCycles);
        });
        this.machine.authManager.registerEndpointPermission("cycle.list", {endpoint: "/v1/cycle/custom", method: "get"});

        //restart cycle, put it there because it conflicts with the POST /:name/:id? route
        this._router.post("/restart/:history_id", async (req: Request, res: Response) => {

            const history = await ProgramHistoryModel.findById(req.params.history_id);

            if(history)
            {
                this.machine.logger.info("PBR assigned for restart");

                this.program = new ProgramBlockRunner(this.machine, history.cycle, history.profile);

                if(this.program.name != history.profile.skeleton)
                {
                    res.status(403);
                    res.write(`Profile ${this.program.name} is not compatible with cycle profile ${history.profile.skeleton}`);
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

        this.machine.authManager.registerEndpointPermission("cycle.list", {endpoint: "/v1/cycle/history", method: "get"});

        this._router.get("/history", async (_req: Request, res: Response) => {

            const histories = await ProgramHistoryModel.find({}).limit(25).sort({ "cycle.status.endDate": "desc" });
            res.json(histories);
        });

        this.machine.authManager.registerEndpointPermission("cycle.list", {endpoint: new RegExp("/v1/cycle/history/.*", "g"), method: "get"});

        this._router.get("/history/:id", async (req: Request, res: Response) => {

            const history = await ProgramHistoryModel.findById(req.params.id);

            if(history != null)
                res.json(history);
            else
                res.status(404).end("history not found");
        });

        this.machine.authManager.registerEndpointPermission("cycle.run", {endpoint: new RegExp("/v1/cycle/restart/.*", "g"), method: "post"});

        //prepare the cycle
        this._router.post("/:name/:id?", async (req: Request, res: Response) => {

            let profile: IProfileMap | undefined = undefined;

            if(req.params.id)
            {
                if(req.params.id.startsWith("premade_"))
                {  
                    const premadeProfile = this.machine.profileController.getPremade(req.params.id.split("_")[1]);

                    if(premadeProfile)
                        profile = this.machine.profileController.retreiveProfile(premadeProfile);
                    else
                    {
                        res.status(404).write("Premade Profile not found");
                        return;
                    }
                }
                else
                   profile = await ProfileModel.findById(req.params.id) as IProfile

                if(!profile)
                {
                    res.status(404);
                    res.end("Profile id was given but profile was not found");
                    return;
                }
            }
            //if the api gets a profile in the body, use it.
            else if(Object.keys(req.body).length !== 0)
            {
                profile = this.machine.profileController.retreiveProfile((req.body as IProfileExportable));
                this.machine.logger.info("CR: Profile given by body");
            }
            else
            {
                this.machine.logger.info("CR: Request does not give a profile");
            }
            
            const cycle = this.machine.specs.cycleTypes.find((ip) => ip.name == req.params.name);

            if(cycle !== undefined)
            {
                this.machine.logger.info("CR: PBR assigned");
                this.program = new ProgramBlockRunner(this.machine, { ...cycle, status: { mode: EPBRMode.CREATED }}, profile);

                if(this.program.profileRequired && profile !== undefined)
                {
                    if(this.program.name != (profile as IProfile).skeleton)
                    {
                        res.status(403);
                        res.write(`Profile ${this.program.name} is not compatible with cycle profile ${(profile as IProfile).skeleton}`);
                        res.end();
                        this.program = undefined;
                        return;
                    }
                }

                res.status(200)
                res.write("ok");
                res.end();
                return;
            }
            else
            {
                res.status(404).write("Cycle not found");
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
                if(this.program.status.mode == EPBRMode.ENDED || EPBRMode.STOPPED || EPBRMode.CREATED)
                {
                    //do not save the history if the program was just created and never started
                    if(this.program.status.mode != EPBRMode.CREATED)
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
                this.program.end("user");  
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