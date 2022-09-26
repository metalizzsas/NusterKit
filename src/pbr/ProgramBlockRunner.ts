import { EventEmitter } from "stream";
import { IOGate } from "../controllers/io/IOGates/IOGate";
import { IProfileMap } from "../controllers/profile/ProfilesController";
import { IPBRStatus, IProgramVariable, IProgramTimer, EPBRMode, IProgramRunner } from "../interfaces/IProgramBlockRunner";
import { EProgramStepResult, EProgramStepType } from "../interfaces/IProgramStep";
import { Machine } from "../Machine";
import { ProgramBlockStep } from "./ProgramBlockStep";
import { PBRStartCondition } from "./startchain/PBRStartCondition";

/**
 * Program Block Runner
 * @desc Manages {@link pbr/ProgramBlocks.index}, {@link pbr/ParameterBlocks.index} & {@link ProgramBlockStep} to handle cycles
 * @class
 */
export class ProgramBlockRunner implements IProgramRunner
{
    status: IPBRStatus;

    //identifiers vars
    name: string;

    profileRequired: boolean;

    variables: IProgramVariable[] = [];
    timers: IProgramTimer[] = [];
    
    /**
     * **PBR** Steps
     */
    steps: ProgramBlockStep[] = [];

    /**
     * Start conditions of the **PBR**
     */
    startConditions: PBRStartCondition[] = [];

    /**
     * Index of the current step being runt
     */
    currentStepIndex = 0;

    //statics
    machine: Machine;
    profile?: IProfileMap;

    /**
     * Function to explore profile fields
     */
    profileExplorer?: (name: string) => number | boolean;

    /**
     * Function to explore io gates
     */
    ioExplorer: (name: string) => IOGate | undefined;

    /**
     * Event Emitter that is used to send envents from sub functions of the **PBR**
     */
    event: EventEmitter;

    nextStepButtonEnabled = false;

    constructor(machine: Machine, object: IProgramRunner, profile?: IProfileMap)
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
            this.profileExplorer = (name: string) => this.profile?.values.get(name.replace(".", "#")) ?? 0;

        //properties assignment
        this.name = object.name;

        //Explorers setup
        this.ioExplorer = (name: string) => this.machine.ioController.gates.find((g) => g.name == name);

        //steps and watchdog
        for(const sc of object.startConditions)
            this.startConditions.push(new PBRStartCondition(sc, this));

        for(const step of object.steps)
            this.steps.push(new ProgramBlockStep(this, step));

        this.event = new EventEmitter();

        this.event.on("end", (ev) => this.end(ev[0] || "event"));

        this.machine.logger.info("PBR: Finished building PBR.");
    }

    /**
     * Runs the cycle
     * @async
     * @returns A boolean stating if the cycle is successful or not
     */
    public async run(): Promise<boolean>
    {
        this.machine.logger.info("PBRSC: Checking Start conditions.");

        const sc = this.startConditions.filter((sc) => sc.canStart == false);

        if(sc.length > 0 && process.env.NODE_ENV == "production")
        {
            this.machine.logger.error("PBRSC: Start conditions are not valid.");
            return false;
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
                case EProgramStepResult.FAILED:
                {
                    return false;
                }
                case EProgramStepResult.PARTIAL:
                {
                    //reset times at the end of a partial step
                    this.steps[this.currentStepIndex].resetTimes();

                    this.machine.logger.info("PBR: Partial step ended, fetching first multiple step.");

                    //if next step does not exists or next step is not a multiple step,
                    //return to first multiple step
                    if(this.steps[this.currentStepIndex + 1].type != EProgramStepType.MULTIPLE)
                    {
                        const j = this.steps.findIndex(step => step.type == EProgramStepType.MULTIPLE);

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

    /**
     * Next step could end the current step to go along the rest of the cycle.
     * @alpha
     */
    public nextStep()
    {
        //this.steps[this.currentStepIndex].end();
    }

    /**
     * Ends the cycle
     * @param reason Optional end reason name
     */
    public end(reason?: string)
    {
        if(this.status.mode == EPBRMode.ENDED)
            return;

        if(reason !== undefined)
            this.machine.logger.warn("PBR: Triggered cycle end with reason: " + reason);

        if(this.currentStepIndex < this.steps.length)
        {
            this.machine.logger.error(`PBR: Program ended before all steps were executed.`);

            //Removing 1 to runCount because the step was stopped before its end
            const s = this.steps.at(this.currentStepIndex)
            if(s !== undefined)
            {
                if(s.type == EProgramStepType.MULTIPLE && s.runCount !== undefined)
                {
                    this.machine.logger.error(`PBR: Last executed step was a multiple step. Removing 1 multiple step iteration.`);
                    s.runCount--;
                }
            }
        }

        //Removing Start conditions timers
        if(this.startConditions.length > 0)
        {
            this.machine.logger.info("PBR: Removing Start Conditions checks.");
            for(const sc of this.startConditions)
                sc.stopTimer();
        }

        //Clearing timer blocks
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
        
        //Append 1 to cycle count
        const m = this.machine.maintenanceController.tasks.find((m) => m.name == "cycleCount");
        m?.append(1);

        this.status.endReason = reason || "finished";
        this.status.mode = EPBRMode.ENDED;
        this.status.endDate = Date.now();

        this.machine.logger.info(`PBR: Ended cycle ${this.name} with state: ${this.status.mode} & reason: ${this.status.endReason}.`);

        //TODO: Make this in the end flow without a timer
        setTimeout(async () => {

            this.machine.logger.info("PBR: Resetting all io gates to default values.");
            for(const g of this.machine.ioController.gates.filter(g => g.bus == "out"))
            {
                await g.write(this.machine.ioController, g.default);
            }
        }, 300);
    }

    /**
     * Compute progress of the cycle
     */
    public get progress()
    {
        let duration = 0;

        for(const step of this.steps)
            duration += step.progress;

        return duration / this.steps.length;
    }

    /**
     * Compute the estimated cycle run time
     */
    public get estimatedRunTime()
    {
        let estimation = 0;

        for(const step of this.steps)
        {
            estimation += step.duration.data()
        }
        return estimation;
    }

    toJSON()
    {
        return {
            status: {...this.status, progress: this.progress, estimatedRunTime: this.estimatedRunTime},

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