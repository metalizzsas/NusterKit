import { Router } from "./Router";

import type { Request, Response } from "express";

import { LoggerInstance } from "../app";
import { AuthManager } from "./middleware/auth";
import type { CyclePremade, ProgramBlockRunner as ProgramBlockRunnerConfig } from "@metalizzsas/nuster-typings/build/spec/cycle";
import type { ProfileHydrated } from "@metalizzsas/nuster-typings/build/hydrated/profiles";
import { ProgramBlockRunner } from "../pbr/ProgramBlockRunner";
import type { ProgramBlockRunnerHydrated } from "@metalizzsas/nuster-typings/build/hydrated/cycle/ProgramBlockRunnerHydrated";
import { TurbineEventLoop } from "../events";

export class CycleRouter extends Router
{
    private supportedCycles: { name: string, profileRequired: boolean }[] = [];
    private premadeCycles: CyclePremade[] = [];
    private cycleTypes: ProgramBlockRunnerConfig[];

    public program?: ProgramBlockRunner;

    constructor(cycleTypes: ProgramBlockRunnerConfig[], cyclePremades: CyclePremade[]) {
        super();

        this.cycleTypes = cycleTypes;

        for (const cycle of cycleTypes)
            this.supportedCycles.push({ name: cycle.name, profileRequired: cycle.profileRequired });

        for (const premade of cyclePremades)
            this.premadeCycles.push({ name: premade.name, profile: premade.profile, cycle: premade.cycle });

        this._configureRouter();
    }

    private _configureRouter() {

        this.router.get("/", (_req, res: Response) => {
            res.status(this.program ? 200 : 404).json(this.program);
        });

        //list all supported cycles premades by this machine
        this.router.get("/premades", (_req: Request, res: Response) => {
            res.json(this.premadeCycles);
        });
        AuthManager.getInstance().registerEndpointPermission("cycle.list", { endpoint: "/v1/cycle/premades", method: "get" });

        //list all supported cycles types by this machine
        this.router.get("/custom", (_req: Request, res: Response) => {
            res.json(this.supportedCycles);
        });
        AuthManager.getInstance().registerEndpointPermission("cycle.list", { endpoint: "/v1/cycle/custom", method: "get" });

        //prepare the cycle
        this.router.post("/:name/:id?", async (req: Request, res: Response) => {

            let profile: ProfileHydrated | undefined = undefined;

            if (req.params.id)
            {
                profile = await new Promise<ProfileHydrated | undefined>(resolve => {
                    TurbineEventLoop.emit(`profile.read`, { profileID: req.params.id, callback: (profile) => {
                        resolve(profile);
                    }});
                });

                if (profile === undefined)
                {
                    res.status(404);
                    res.end("Profile id was given but profile was not found");
                    return;
                }
            }
            else if (Object.keys(req.body).length !== 0)
            {
                //if the api gets a profile in the body, use it.
                profile = req.body as ProfileHydrated;
                LoggerInstance.info("CR: Profile given by body");
            }
            else
            {
                LoggerInstance.info("CR: Request does not give a profile");
            }

            const cycle = this.cycleTypes.find((ct) => ct.name == req.params.name);

            if (cycle !== undefined)
            {
                LoggerInstance.info("CR: PBR assigned");
                this.program = new ProgramBlockRunner(cycle, profile);

                if (this.program.profileRequired && profile !== undefined)
                {
                    if (this.program.name != profile.skeleton)
                    {
                        res.status(403);
                        res.write(`Profile ${this.program.name} is not compatible with cycle profile ${profile.skeleton}`);
                        res.end();
                        this.program = undefined;
                        return;
                    }
                }

                res.status(200);
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

        AuthManager.getInstance().registerEndpointPermission("cycle.run", { endpoint: new RegExp("/v1/cycle/.*", "g"), method: "post" });

        //start the cycle
        this.router.put("/", async (req: Request, res: Response) => {
            if (this.program !== undefined) {
                this.program.run();
                res.status(200);
                res.end();
            }
            else {
                res.status(404);
                res.end();
            }
        });

        AuthManager.getInstance().registerEndpointPermission("cycle.nextStep", { endpoint: "/v1/cycle/nextStep", method: "put"});

        this.router.put("/nextStep", async(req: Request, res: Response) => {
            if (this.program !== undefined) {
                this.program.nextStep();
                res.status(200);
                res.end();
            }
            else {
                res.status(404);
                res.end();
            }
        });

        AuthManager.getInstance().registerEndpointPermission("cycle.run", { endpoint: "/v1/cycle/", method: "put" });

        //rate the cycle and remove it
        this.router.patch("/:rating", (req: Request, res: Response) => {
            if (this.program) {
                if (["ended", "ending", "created"].includes(this.program.status.mode)) {
                    //do not save the history if the program was just created and never started
                    if (this.program.status.mode == "created")
                        this.program.dispose();
                    
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
            else {
                //cycle is not defined
                res.status(404);
                res.write("Can't rate a non existing cycle");
                res.end();
            }
        });

        AuthManager.getInstance().registerEndpointPermission("cycle.run", { endpoint: "/v1/cycle/.*", method: "patch" });

        //stops the cycle
        this.router.delete("/", async (req: Request, res: Response) => {
            if (this.program !== undefined) {
                this.program.end("user");
                res.status(200);
                res.end();
            }
            else {
                res.status(404);
                res.end();
            }
        });

        AuthManager.getInstance().registerEndpointPermission("cycle.run", { endpoint: "/v1/cycle/", method: "delete" });
    }

    public get socketData(): ProgramBlockRunnerHydrated | undefined {
        return this.program;
    }
}