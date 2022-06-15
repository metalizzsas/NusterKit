import { EventEmitter } from "stream";
import { IOExplorer } from "../controllers/io/IOExplorer";
import { ProfileExplorer } from "../controllers/profile/ProfileExplorer";
import { EIOGateBus } from "../interfaces/gates/IIOGate";
import { IProfile } from "../interfaces/IProfile";
import { IProgram, IPBRStatus, IProgramVariable, IProgramTimer, EPBRMode } from "../interfaces/IProgramBlockRunner";
import { ProgramStepResult, ProgramStepType } from "../interfaces/IProgramStep";
import { Machine } from "../Machine";
import { ProgramBlockStep } from "./ProgramBlockStep";
import { PBRStartCondition } from "./startchain/PBRStartCondition";

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

    startConditions: PBRStartCondition[] = [];

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
        this.status = { mode: EPBRMode.CREATED };

        this.machine = machine;

        this.machine.logger.info("PBR: Building PBR...");

        this.profileRequired = object.profileRequired;

        //if this is defined it should be a cycle restart
        if(object.currentStepIndex)
            this.currentStepIndex = object.currentStepIndex;

        if(object.variables)
            this.variables = object.variables;

        if(object.timers)
            this.timers = object.timers;

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
        for(const sc of object.startConditions)
            this.startConditions.push(new PBRStartCondition(sc, this));

        for(const step of object.steps)
            this.steps.push(new ProgramBlockStep(this, step));

        this.event = new EventEmitter();

        this.event.on("end", (ev) => this.end(ev[0] || "event"));

        this.machine.logger.info("PBR: Finished building PBR.");
        
    }

    public async run()
    {
        this.machine.logger.info("PBRSC: Checking Start conditions.");

        const sc = this.startConditions.filter((sc) => sc.canStart == false);

        if(sc.length > 0 && process.env.NODE_ENV == "production")
        {
            this.machine.logger.error("PBRSC: Start conditions are not valid.");
            return;
        }

        this.machine.logger.info("PBRSC: Start conditions are valid.");
        this.machine.logger.info("PBRSC: Removing Start conditions that are only used at start.");

        for(const sc of this.startConditions)
        {
            const index = this.startConditions.indexOf(sc);
            if(sc.startOnly && index != -1)
            {
                this.startConditions.splice(index, 1);
                this.machine.logger.trace("PBRSC: Removed " + sc.conditionName);
            }
        }

        this.machine.logger.info(`PBR: Started cycle ${this.name}.`);

        this.status.mode = EPBRMode.STARTED;
        this.status.startDate = Date.now();

        while(this.currentStepIndex < this.steps.length)
        {
            let result = null;
            
            // TypeScriptCompiler is not able to understand that status.mode can be changed externally
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore: disabled overlap checking
            if(this.status.mode != EPBRMode.ENDED)
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
            if(this.status.mode != EPBRMode.ENDED)
                this.currentStepIndex++;
        }

        this.end();
        return true;
    }

    //TODO: Integrate nextStep
    public nextStep()
    {
        //this.steps[this.currentStepIndex].end();
    }

    public end(reason?: string)
    {
        if(this.status.mode == EPBRMode.ENDED)
            return;

        this.machine.logger.warn("PBR: Triggered cycle end with reason: " + reason);

        if(this.currentStepIndex < this.steps.length)
        {
            this.machine.logger.error(`PBR: Program ended before all steps were executed.`);

            //Removing 1 to runCount because the step was stopped before its end
            const s = this.steps.at(this.currentStepIndex)
            if(s !== undefined)
            {
                if(s.type == ProgramStepType.MULTIPLE && s.runCount !== undefined)
                {
                    this.machine.logger.error(`PBR: Last executed step was a multiple step. Removing 1 multiple step iteration.`);
                    s.runCount--;
                }
            }
        }

        if(this.startConditions.length > 0)
        {
            this.machine.logger.info("PBR: Removing Start Conditions checks.");
            for(const sc of this.startConditions)
            {
                sc.stopTimer();
            }
        }

        //clearing timers
        if(this.timers.length > 0)
        {
            this.machine.logger.info("PBR: Cleaning timers.");
            for(const timer of this.timers)
            {
                this.machine.logger.info("PBR: Clearing timer: " + timer.name);
                if(timer.timer !== undefined)
                    clearInterval(timer.timer);
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
        this.status.mode = EPBRMode.ENDED;
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
            startConditions: this.startConditions,

            //internals
            currentStepIndex: this.currentStepIndex,

            //statics
            profile: this.profile
        }
    }
}