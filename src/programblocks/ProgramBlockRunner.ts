import { EventEmitter } from "stream";
import { IOExplorer } from "../controllers/io/IOExplorer";
import { IProfile } from "../controllers/profile/Profile";
import { ProfileExplorer } from "../controllers/profile/ProfileExplorer";
import { Machine } from "../Machine";
import { IProgramStep, ProgramBlockStep, ProgramStepResult, ProgramStepType } from "./ProgramBlockStep";
import { IWatchdogCondition, WatchdogCondition } from "./Watchdog";

export class ProgramBlockRunner implements IProgram
{
    status: IPBRStatus;

    //identifiers vars
    name: string;
    
    //Inside definers
    steps: ProgramBlockStep[] = [];
    watchdogConditions: IWatchdogCondition[] = [];

    //internals
    currentStepIndex = 0;

    //statics
    machine: Machine;
    profile: IProfile;

    //explorers
    profileExplorer: ProfileExplorer;
    ioExplorer: IOExplorer;

    //event
    event: EventEmitter;
    
    constructor(machine: Machine, profile: IProfile, object: IProgram)
    {
        this.status = { mode: PBRMode.CREATED };

        this.machine = machine;

        this.machine.logger.info("Building PBR...");

        //if this is defined it should be a cycle restart
        if(object.currentStepIndex)
            this.currentStepIndex = object.currentStepIndex;

        this.profile = profile;

        //properties assignment
        this.name = object.name;

        //Explorers setup
        this.profileExplorer = new ProfileExplorer(this.profile);
        this.ioExplorer = new IOExplorer(machine.ioController);

        //steps and watchdog
        for(const watchdog of object.watchdogConditions)
            this.watchdogConditions.push(new WatchdogCondition(this, watchdog));

        for(const step of object.steps)
            this.steps.push(new ProgramBlockStep(this, step));

        this.event = new EventEmitter();

        this.event.on("end", (ev) => this.end(ev[0] || "event"));

        this.machine.logger.info("Finished building PBR.");
    }

    public async run()
    {
        //TODO: Add resume program option
        //TODO: Should be done by looking into the ProgramHistoryObject

        this.machine.logger.info("Checking Watchdog Conditions");

        const w = this.watchdogConditions.filter((watchdog) => watchdog.result == false);

        if(w.length > 0 && process.env.NODE_ENV == "production")
        {
            this.machine.logger.error("Watchdog conditions are not ok to start.");
            return;
        }

        this.machine.logger.info(`Started cycle ${this.name}.`);

        this.status.mode = PBRMode.STARTED;

        while(this.currentStepIndex < this.steps.length)
        {
            let result = null;
            
            // TypeScriptCompiler is not able to understand that status.mode can be changed externally
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore: disabled overlap checking
            if(this.status.mode != PBRMode.ENDED)
                result = await this.steps[this.currentStepIndex].execute();
            else
                break;

            switch(result)
            {
                case ProgramStepResult.FAILED:
                {
                    return false;
                }
                case ProgramStepResult.PARTIAL:
                {
                    //reset times at the end of a partial step
                    this.steps[this.currentStepIndex].resetTimes();

                    //if next step does not exists or next step is not a multiple step,
                    //return to first multiple step
                    if(this.steps[this.currentStepIndex + 1].type != ProgramStepType.MULTIPLE)
                    {
                        const j = this.steps.findIndex((step) => step.type == ProgramStepType.MULTIPLE)

                        if(j > -1)
                            this.currentStepIndex = j;
                        else 
                            throw new Error("Failed to find first Multiple executions step");
                        continue;
                    }
                }
            }
            this.currentStepIndex++;
        }

        this.end();

        return true;
    }

    public end(reason?: string)
    {
        if(this.status.mode == PBRMode.ENDED)
            return;

        if(this.currentStepIndex < this.steps.length)
        {
            this.machine.logger.error(`Program ended before all steps were executed.`);
            this.machine.logger.error(`Executing ending IO of last step.`);
            this.steps.at(-1)?.executeLastIO();
        }
        
        const m = this.machine.maintenanceController.tasks.find((m) => m.name == "cycleCount");
        m?.append(1);

        this.status.endReason = reason || "finished";
        this.status.mode = PBRMode.ENDED;
        //TODO: Resorbs all timers and everything
        this.machine.logger.info(`Ended cycle ${this.name} with state: ${this.status.mode} and reason ${this.status.endReason}.`);
    }

    public get progress()
    {
        let duration = 0;

        for(const step of this.steps)
            duration += step.progress;

        return duration / this.steps.length;
    }

    toJSON()
    {
        return {
            status: {...this.status, progress: this.progress},

            //identifiers vars
            name: this.name,
            
            //Inside definers
            steps: this.steps,
            watchdogConditions: this.watchdogConditions,

            //internals
            currentStepIndex: this.currentStepIndex,

            //statics
            profile: this.profile
        }
    }
}

export interface IPBRStatus
{
    mode: PBRMode,
    
    startDate?: number,
    endDate?: number,
    endReason?: string,

    progress?: number
}

export interface IProgram
{
    name: string;

    currentStepIndex?: number;

    status: IPBRStatus;
    steps: IProgramStep[];
    watchdogConditions: IWatchdogCondition[];
}

export enum PBRMode
{
    CREATED = "created",
    STARTED = "started",
    PAUSED = "paused",
    WAITING_PAUSE = "waiting-for-pause",
    STOPPED = "stopped",
    WAITING_STOP = "waiting-for-stop",
    ENDED = "ended"
}