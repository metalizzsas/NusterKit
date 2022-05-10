import { EventEmitter } from "stream";
import { IOExplorer } from "../controllers/io/IOExplorer";
import { ProfileExplorer } from "../controllers/profile/ProfileExplorer";
import { EIOGateBus } from "../interfaces/gates/IIOGate";
import { IProfile } from "../interfaces/IProfile";
import { IProgram, IPBRStatus, IProgramVariable, IProgramTimer, PBRMode } from "../interfaces/IProgramBlockRunner";
import { ProgramStepResult, ProgramStepType } from "../interfaces/IProgramStep";
import { Machine } from "../Machine";
import { ProgramBlockStep } from "./ProgramBlockStep";
import { WatchdogCondition } from "./Watchdog";

export class ProgramBlockRunner implements IProgram
{
    status: IPBRStatus;

    //identifiers vars
    name: string;

    profileRequired: boolean;

    variables: IProgramVariable[] = [];
    timers: IProgramTimer[] = [];
    
    //Inside definers
    steps: ProgramBlockStep[] = [];
    watchdogConditions: WatchdogCondition[] = [];

    //internals
    currentStepIndex = 0;

    //statics
    machine: Machine;
    profile?: IProfile;

    //explorers
    profileExplorer?: ProfileExplorer;
    ioExplorer: IOExplorer;

    //event
    event: EventEmitter;

    nextStepButtonEnabled = false;
    
    constructor(machine: Machine, object: IProgram, profile?: IProfile)
    {
        this.status = { mode: PBRMode.CREATED };

        this.machine = machine;

        this.machine.logger.info("PBR: Building PBR...");

        this.profileRequired = object.profileRequired;

        //if this is defined it should be a cycle restart
        if(object.currentStepIndex)
            this.currentStepIndex = object.currentStepIndex;

        if(object.variables)
            this.variables = object.variables;

        this.profile = profile;

        if(this.profile === undefined)
            this.machine.logger.warn("PBR: This PBR is build without any profile.");
        else
            this.profileExplorer = new ProfileExplorer(this.profile);

        //properties assignment
        this.name = object.name;

        //Explorers setup
        
        this.ioExplorer = new IOExplorer(machine.ioController);

        //steps and watchdog
        for(const watchdog of object.watchdogConditions)
            this.watchdogConditions.push(new WatchdogCondition(this, watchdog));

        for(const step of object.steps)
            this.steps.push(new ProgramBlockStep(this, step));

        this.event = new EventEmitter();

        this.event.on("end", (ev) => this.end(ev[0] || "event"));

        this.machine.logger.info("PBR: Finished building PBR.");
        
    }

    public async run()
    {
        this.machine.logger.info("PBR: Checking Watchdog Conditions");

        const w = this.watchdogConditions.filter((watchdog) => watchdog.result == false);

        if(w.length > 0 && process.env.NODE_ENV == "production")
        {
            this.machine.logger.error("PBR: Watchdog conditions are not ok to start.");
            return;
        }

        this.machine.logger.info(`PBR: Started cycle ${this.name}.`);

        this.status.mode = PBRMode.STARTED;
        this.status.startDate = Date.now();

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

                    this.machine.logger.info("PBR: Partial step ended, fetching first multiple step.");

                    //if next step does not exists or next step is not a multiple step,
                    //return to first multiple step
                    if(this.steps[this.currentStepIndex + 1].type != ProgramStepType.MULTIPLE)
                    {
                        const j = this.steps.findIndex(step => step.type == ProgramStepType.MULTIPLE);

                        if(j != -1)
                        {
                            this.machine.logger.info("PBR: Next partial step: " + this.steps[j].name);
                            this.currentStepIndex = j;
                        }
                        else
                        {
                            this.machine.logger.error("PBR: No first multiple step found.");
                            this.end("partial-definition-error");
                        }
                        continue;
                    }
                    else
                    {
                        this.machine.logger.info("PBR: Next partial step not found, going next step.");
                    }
                }
            }
            
            // TypeScriptCompiler is not able to understand that status.mode can be changed externally
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore: disabled overlap checking
            if(this.status.mode != PBRMode.ENDED)
                this.currentStepIndex++;
        }

        this.end();

        return true;
    }

    public nextStep()
    {
        //this.steps[this.currentStepIndex].end();
    }

    public end(reason?: string)
    {
        if(this.status.mode == PBRMode.ENDED)
            return;

        this.machine.logger.warn("PBR: Triggered cycle end with reason: " + reason);

        if(this.currentStepIndex < this.steps.length)
        {
            this.machine.logger.error(`PBR: Program ended before all steps were executed.`);
        }

        if(this.watchdogConditions.length > 0)
        {
            this.machine.logger.info("PBR: Removing Watchdog checks.");
            for(const w of this.watchdogConditions)
            {
                w.stopTimer();
            }
        }

        //clearing timers
        if(this.timers.length > 0)
        {
            this.machine.logger.warn("PBR: Cleaning timers.");
            for(const timer of this.timers.filter(t => t.enabled))
            {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                clearInterval(timer.timer!);
            }
        }

        this.machine.logger.info("PBR: Resetting all io gates to default values.");
        for(const g of this.machine.ioController.gates.filter(g => g.bus == EIOGateBus.OUT))
        {
            g.write(this.machine.ioController, g.default);
        }
        
        
        const m = this.machine.maintenanceController.tasks.find((m) => m.name == "cycleCount");
        m?.append(1);

        this.status.endReason = reason || "finished";
        this.status.mode = PBRMode.ENDED;
        this.status.endDate = Date.now();
        //TODO: Resorbs all timers and everything
        this.machine.logger.info(`PBR: Ended cycle ${this.name} with state: ${this.status.mode} and reason ${this.status.endReason}.`);
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