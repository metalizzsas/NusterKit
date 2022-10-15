import { Controller } from "../Controller";

import type { Request, Response } from "express";

import { LoggerInstance } from "../../app";
import { AuthManager } from "../../auth/auth";
import { ProgramBlockRunner } from "../../pbr/ProgramBlockRunner";
import { ProfileModel } from "../profile/ProfileModel";
import { ProfileController } from "../profile/ProfilesController";
import { ProgramHistoryModel } from "./ProgramHistoryModel";
import type { IProgramBlockRunnerHydrated } from "@metalizzsas/nuster-typings/build/hydrated/cycle/IProgramRunnerHydrated";
import type { IPBRPremades, IProgram} from "@metalizzsas/nuster-typings/build/spec/cycle/IProgramBlockRunner";
import type { IProfileHydrated } from "@metalizzsas/nuster-typings/build/hydrated/profile";

export class CycleController extends Controller {

    private supportedCycles: { name: string, profileRequired: boolean }[] = [];
    private premadeCycles: IPBRPremades[] = [];
    private cycleTypes: IProgram[];

    public program?: ProgramBlockRunner;

    private maskedPremades: string[];

    private static _instance: CycleController;

    constructor(cycleTypes: IProgram[], cyclePremades: IPBRPremades[], maskedPremades: string[] = []) {
        super();

        this.cycleTypes = cycleTypes;

        this.maskedPremades = maskedPremades;

        this._configure(cycleTypes, cyclePremades);
        this._configureRouter();
    }

    static getInstance(cycleTypes?: IProgram[], cyclePremades?: IPBRPremades[], maskedPremades?: string[])
    {
        if(!this._instance)
            if(cycleTypes !== undefined && cyclePremades !== undefined)
                this._instance = new CycleController(cycleTypes, cyclePremades, maskedPremades);
            else
                throw new Error("CycleController: Failed to instantiate, missing data");

        return this._instance;
    }

    private _configure(cycleTypes: IProgram[], cyclePremades: IPBRPremades[])
    {
        for (const cycle of cycleTypes)
            this.supportedCycles.push({ name: cycle.name, profileRequired: cycle.profileRequired });

        for (const premade of cyclePremades)
        {
            //skip the premade if its masked on machine settings
            if (this.maskedPremades.includes(premade.name))
                LoggerInstance.info(`CycleController: Skipping premade cycle ${premade.name} because it is masked on machine settings.`);
            else
                this.premadeCycles.push({ name: premade.name, profile: premade.profile, cycle: premade.cycle });
        }
    }

    private _configureRouter() {
        //list all supported cycles premades by this machine
        this._router.get("/premades", (_req: Request, res: Response) => {
            res.json(this.premadeCycles);
        });
        AuthManager.getInstance().registerEndpointPermission("cycle.list", { endpoint: "/v1/cycle/premades", method: "get" });

        //list all supported cycles types by this machine
        this._router.get("/custom", (_req: Request, res: Response) => {
            res.json(this.supportedCycles);
        });
        AuthManager.getInstance().registerEndpointPermission("cycle.list", { endpoint: "/v1/cycle/custom", method: "get" });

        //restart cycle, put it there because it conflicts with the POST /:name/:id? route
        this._router.post("/restart/:history_id", async (req: Request, res: Response) => {

            const history = await ProgramHistoryModel.findById(req.params.history_id);

            if (history) {
                LoggerInstance.info("PBR assigned for restart");

                const profile = ProfileController.getInstance().hydrateProfile(history.profile);

                if(profile !== undefined)
                {
                    this.program = new ProgramBlockRunner(history.cycle, profile);

                    if (this.program.name != history.profile.skeleton) {
                        res.status(403);
                        res.write(`Profile ${this.program.name} is not compatible with cycle profile ${history.profile.skeleton}`);
                        res.end();
                        this.program = undefined;
                        return;
                    }
                    else {
                        res.status(200)
                        res.write("ok");
                        res.end();
                        return;
                    }
                }
                else
                {
                    res.status(403).write("Failed to load history profile");
                    res.end();
                    return;
                }
            }
            else {
                res.status(404).write("HistoryPoint not found");
                return;
            }
        });

        AuthManager.getInstance().registerEndpointPermission("cycle.list", { endpoint: "/v1/cycle/history", method: "get" });

        this._router.get("/history", async (_req: Request, res: Response) => {

            const histories = await ProgramHistoryModel.find({}).limit(25).sort({ "cycle.status.endDate": "desc" });
            res.json(histories);
        });

        AuthManager.getInstance().registerEndpointPermission("cycle.list", { endpoint: new RegExp("/v1/cycle/history/.*", "g"), method: "get" });

        this._router.get("/history/:id", async (req: Request, res: Response) => {

            const history = await ProgramHistoryModel.findById(req.params.id);

            if (history != null)
                res.json(history);
            else
                res.status(404).end("history not found");
        });

        AuthManager.getInstance().registerEndpointPermission("cycle.run", { endpoint: new RegExp("/v1/cycle/restart/.*", "g"), method: "post" });

        //prepare the cycle
        this._router.post("/:name/:id?", async (req: Request, res: Response) => {

            let profile: IProfileHydrated | undefined = undefined;

            if (req.params.id) {
                if (req.params.id.startsWith("premade_")) {
                    const premadeProfile = ProfileController.getInstance().getPremade(req.params.id.split("_")[1]);

                    if (premadeProfile)
                        profile = premadeProfile;
                    else {
                        res.status(404).write("Premade Profile not found");
                        return;
                    }
                }
                else
                    profile = await ProfileModel.findById(req.params.id).lean();

                if (!profile) {
                    res.status(404);
                    res.end("Profile id was given but profile was not found");
                    return;
                }
            }
            //if the api gets a profile in the body, use it.
            else if (Object.keys(req.body).length !== 0) {
                profile = req.body as IProfileHydrated;
                LoggerInstance.info("CR: Profile given by body");
            }
            else {
                LoggerInstance.info("CR: Request does not give a profile");
            }

            const cycle = this.cycleTypes.find((ct) => ct.name == req.params.name);

            if (cycle !== undefined) {
                LoggerInstance.info("CR: PBR assigned");
                this.program = new ProgramBlockRunner({ ...cycle, status: { mode: "created" } }, profile);

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
            else {
                res.status(404).write("Cycle not found");
                return;
            }
        });

        AuthManager.getInstance().registerEndpointPermission("cycle.run", { endpoint: new RegExp("/v1/cycle/.*", "g"), method: "post" });

        //start the cycle
        this._router.put("/", async (req: Request, res: Response) => {
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

        this._router.put("/nextStep", async(req: Request, res: Response) => {
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
        this._router.patch("/:rating", async (req: Request, res: Response) => {
            if (this.program) {
                if (["ended", "ending", "created"].includes(this.program.status.mode)) {
                    //do not save the history if the program was just created and never started
                    if (this.program.status.mode != "created") {
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
                else {
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
        this._router.delete("/", async (req: Request, res: Response) => {
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

    public get socketData(): IProgramBlockRunnerHydrated | undefined {
        // TODO check for type assertion here it might be off
        return this.program as unknown as IProgramBlockRunnerHydrated | undefined;
    }
}