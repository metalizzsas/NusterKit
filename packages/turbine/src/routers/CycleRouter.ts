import { Router } from "./Router";

import { type Request, type Response } from "express";

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

        this.supportedCycles = this.cycleTypes.map((c) => { return { name: c.name, profileRequired: c.profileRequired }});
        this.premadeCycles = cyclePremades;

        this._configureRouter();
    }

    private _configureRouter() {

        /** Route to list all supported premades by the machine */
        this.router.get("/premades", (_req: Request, res: Response) => {
            res.json(this.premadeCycles);
        });

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
                    res.status(404).end("Profile id was given but profile was not found.");
                    return;
                }
            }
            else if(Object.keys(req.body).length > 0)
            {
                profile = req.body as ProfileHydrated;
                TurbineEventLoop.emit("log", "info", "CR: Profile given by body.");
            }
            else
                TurbineEventLoop.emit("log", "warning", "CR: Request does not give a profile");

            const cycle = this.cycleTypes.find((ct) => ct.name === req.params.name);

            if(cycle === undefined)
            {
                res.status(404).end("Cycle not found");
                return;
            }

            TurbineEventLoop.emit("log", "info", "CR: Config PBR found.")
            this.program = new ProgramBlockRunner(cycle, profile);

            if (this.program.profileRequired && profile !== undefined && this.program.name !== profile.skeleton)
            {
                res.status(400).end(`Profile ${this.program.name} is not compatible with cycle profile ${profile.skeleton}.`);
                this.program = undefined;
                return;
            }

            res.status(200).end("ready");
        });

        this.router.all("/", (_req, res, next) => {
            if(this.program === undefined)
                res.status(404).end("Cycle not started");
            else
                next();
        });
        
        /** Route to start a cycle */
        this.router.post("/", async (_req, res: Response) => {
            this.program?.run();
            res.status(200).end();
        });

        /** Route to trigger next step for the cycle */
        this.router.put("/", async (_req, res: Response) => {
            this.program?.nextStep();
            res.status(200).end();
        });

        this.router.put("/pause", async (_req, res: Response) => {
            TurbineEventLoop.emit(`pbr.${(this.program?.status.mode === "paused") ? "resume" : "pause"}`);
            res.status(200).end((this.program?.status.mode === "paused") ? "resuming" : "pausing");
        });

        /** Dispose the cycle and delete it */
        this.router.patch("/", async (_req, res: Response) => {
            if (["ended", "created"].includes(this.program?.status.mode ?? ""))
            {
                this.program = undefined;

                res.status(200).end();
            }
            else
                res.status(403).end("Cant dispose a cycle that has not ended call DELETE:/api/v1/ first.");
        });

        /** Route to stop the cycle */
        this.router.delete("/", async (_req, res: Response) => {
            this.program?.end("user");
            res.status(200).end();
        });
    }

    public get socketData(): ProgramBlockRunnerHydrated | undefined {
        return this.program as unknown as ProgramBlockRunnerHydrated;
    }
}