import type { PBRStep, PBRStepResult, PBRStepState, PBRStepType } from "../types/spec/cycle/PBRStep";
import type { NumericParameterBlockHydrated } from "../types/hydrated/cycle/blocks/ParameterBlockHydrated";
import type { ProgramBlockHydrated } from "../types/hydrated/cycle/blocks/ProgramBlockHydrated";
import type { ProgramBlockRunner } from "./ProgramBlockRunner";
import { ParameterBlockRegistry } from "./ParameterBlocks/ParameterBlockRegistry";
import { ProgramBlockRegistry } from "./ProgramBlocks/ProgramBlockRegistry";
import { TurbineEventLoop } from "../events";
import { PBRRunCondition } from "./PBRSecurityCondition";

export class ProgramBlockStep
{
    private pbrInstance: ProgramBlockRunner;

    name: string;

    /** Current step state, Setting this flag to `ENDING` should end the step faster */
    state: PBRStepState = "created";
    type: PBRStepType = "single";

    endReason?: string;
    
    isEnabled: NumericParameterBlockHydrated;

    startTime?: number;
    endTime?: number;
    
    runCount = 0;
    runAmount?: NumericParameterBlockHydrated;

    partialStepFallback?: number;
    crashStepFallback?: number;
    
    blocks: Array<ProgramBlockHydrated> = [];
    startBlocks: Array<ProgramBlockHydrated> = [];
    endBlocks: Array<ProgramBlockHydrated> = [];

    runConditions: Array<PBRRunCondition> = [];

    stepOvertimeTimer?: NodeJS.Timeout;

    duration: number;

    stepRuncontroller: AbortController = new AbortController();

    totalPauseTime = 0;
    currentPauseStartDate?: number;
    
    constructor(pbrInstance: ProgramBlockRunner, obj: PBRStep)
    {
        this.pbrInstance = pbrInstance;
        this.name = obj.name;
        this.isEnabled = ParameterBlockRegistry.Numeric(obj.isEnabled);

        this.partialStepFallback = obj.partialStepFallback;
        this.crashStepFallback = obj.crashStepFallback;

        if(obj.runAmount)
        {
            this.runAmount = ParameterBlockRegistry.Numeric(obj.runAmount);
            this.type = (this.runAmount?.data ?? 0) > 1 ? "multiple" : "single";
        }

        // Build blocks
        obj.startBlocks.forEach(b => this.startBlocks.push(ProgramBlockRegistry(b)));
        obj.endBlocks.forEach(b => this.endBlocks.push(ProgramBlockRegistry(b)));
        obj.blocks.forEach(b => this.blocks.push(ProgramBlockRegistry(b)));

        // Build run conditions
        obj.runConditions?.forEach(rc => this.runConditions.push(new PBRRunCondition(rc, (data) => {
            this.crash(`security-${data.name}`);
        })));

        this.duration = this.estimateRunTime();

        /** Listen for step end events */
        TurbineEventLoop.addListener(`pbr.step.${this.name}.stop`, (reason?: string) => {
            if(this.state == "started")
            {
                 TurbineEventLoop.emit('log', 'warning', `PBS-${this.name}: Step has been stopped by the user. Reason: ${reason ?? "No reason given."}`);
                this.state = "ending";

                this.stepRuncontroller.abort();
            }
        });

        TurbineEventLoop.on('pbr.pause', () => {
            if(this.state === "started")
            {
                this.currentPauseStartDate = Date.now();
            }
        });

        TurbineEventLoop.on('pbr.resume', () => {
            if(this.state === "started")
            {
                this.totalPauseTime += (Date.now() - (this.currentPauseStartDate ?? 0)) / 1000;
                this.currentPauseStartDate = undefined;
            }
        });
    }

    public async execute(): Promise<PBRStepResult>
    {
        // End step if disabled
        if(this.isEnabled.data == 0)
        {
             TurbineEventLoop.emit('log', 'warning', `PBS-${this.name}: Step is disabled.`);
            return "next";
        }

        if(this.pbrInstance.status.mode == "ended")
        {
             TurbineEventLoop.emit('log', 'warning', `PBS-${this.name}: Tried to execute step while cycle ended.`);
            return "next";
        }

        // Reset abort controller if step is multiple and runCount > 0
        if(this.type === "multiple" && this.runCount > 0)
        {
            this.stepRuncontroller = new AbortController();
            this.endReason = undefined;
        }

         TurbineEventLoop.emit('log', 'info', `PBS-${this.name}: Started step.`);
        this.pbrInstance.addEvent(`PBS: Started ${this.name} step.`);
        this.state = "started";

        //Disable step overtime timeout if the step duration is equal to -1
        if(this.duration != Infinity)
            this.stepOvertimeTimer = setTimeout(() => {

                if(this.state == "started")
                {
                     TurbineEventLoop.emit('log', 'error', `PBS-${this.name}: Step has been too long. Triggering stepOvertime.`); 
                    this.pbrInstance.end("stepOvertime"); 
                }
                else
                     TurbineEventLoop.emit('log', 'warning', `PBS-${this.name}: Step overtime has been canceled because step was not running.`);
            }, this.duration * 2000 + this.overallPausedTime * 1000);

        this.startTime = Date.now();

         TurbineEventLoop.emit('log', 'info', `PBS-${this.name}: Executing io starter blocks.`);

        for(const io of this.startBlocks)
        {
            await io.execute();
        }

         TurbineEventLoop.emit('log', 'info', `PBS-${this.name}: Executing step main blocks.`);
        for(const b of this.blocks)
        {
            await b.execute(this.stepRuncontroller.signal);
        }

         TurbineEventLoop.emit('log', 'info', `${this.name}: Executing io ending blocks.`);
        for(const io of this.endBlocks)
        {
            await io.execute();
        }

        if(this.stepOvertimeTimer)
            clearTimeout(this.stepOvertimeTimer);

        this.runCount++;
        
        // Handle step end

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if(this.state === "crashed")
        {
            this.state = "crashed";
             TurbineEventLoop.emit('log', 'info', `PBS-${this.name}: Ended step with state ${this.state}`);
            this.endTime = Date.now();

            return this.crashStepFallback ?? "next";
        }

        if(this.type === "multiple")
        {
            if(this.runCount >= (this.runAmount?.data ?? 1))
            {
                this.state = "ended";
                 TurbineEventLoop.emit('log', 'info', `PBS-${this.name}: Ended step with state ${this.state}`);
                this.endTime = Date.now();

                return "next";
            }
            else
            {
                this.state = "partial";
                 TurbineEventLoop.emit('log', 'info', `PBS-${this.name}: Ended step partialy with state ${this.state}`);
                this.endTime = Date.now();

                return this.partialStepFallback ?? "next";
            }
        }
        else
        {
            this.state = "ended";
             TurbineEventLoop.emit('log', 'info', `PBS-${this.name}: Ended step with state ${this.state}`);
            this.endTime = Date.now();

            return "next";
        }
    }

    /**
     * Crash the step, use the abortController to stop running blocks.
     */
    public crash(reason?: string)
    {
        if(this.state !== "started")
            return;
        
        this.endReason = reason;
         TurbineEventLoop.emit('log', 'info', `PBS: Crashing ${this.name} with reason: ${this.endReason}.`);
        this.stepRuncontroller.abort();
        this.state = "crashed";

        this.pbrInstance.addEvent(`PBS: Step crashed ${this.name}, reason: ${this.endReason ?? "no reason given"}.`);
        
    }

    public end(reason?: string)
    {
        if(this.state !== "started")
            return;
        
        this.endReason = reason;
         TurbineEventLoop.emit('log', 'info', `PBS: Ending ${this.name} with reason: ${this.endReason}.`)
        this.stepRuncontroller.abort();
        this.state = "ended";

        this.pbrInstance.addEvent(`PBS: Step ${this.name} ended, reason: ${this.endReason ?? "No reason given"}.`);
    }

    /** Estimate the run time of this step */
    private estimateRunTime(): number
    {
        let stepRunTime = [...this.endBlocks, ...this.startBlocks, ...this.blocks].reduce((p, c) => p + c.estimatedRunTime, 0);

        if(this.runAmount !== undefined)
            stepRunTime = this.runAmount?.data * stepRunTime;

        return stepRunTime;
    }

    get progress()
    {
        let progress = 0;

        let realDuration = this.duration;

        // Special case where a multiple step has unknown duration
        if(this.type === "multiple" && realDuration === Infinity && (this.runAmount?.data ?? 1) > 1)
            return this.runCount / (this.runAmount?.data ?? 1)
        
        // Divide the duration by the runAmount if the step is multiple, in order to make progressbars splitable
        if(this.type === "multiple" && (this.runAmount?.data ?? 1 > 1))
        {
            realDuration = realDuration / (this.runAmount?.data ?? 1);
        }

        if(this.state === "started")
        {
            if(realDuration != Infinity)
            {
                progress = (((Date.now() - (this.startTime ?? 1)) / 1000) - this.overallPausedTime) / realDuration;
                progress = progress >= 1 ? 1 : progress;
            }
            else
                progress = -1;
        }
        else if(["ended", "partial", "crashed"].includes(this.state))
        {
            if(this.endReason === "skipped" || this.endReason?.includes("security"))
                progress = (((this.endTime ?? 1) - (this.startTime ?? 1)) / 1000) / realDuration;
            else
                progress = 1;
        }
        
        if((this.type == "multiple") && this.runAmount !== undefined)
            return (this.runCount / this.runAmount.data) + (progress / this.runAmount.data)

        return progress;
    }

    public resetTimes()
    {
        this.startTime = undefined;
        this.endTime = undefined;
    }

    get overallPausedTime(): number
    {
        const currentPauseTime = (this.currentPauseStartDate !== undefined) ? (Date.now() - this.currentPauseStartDate) : 0;
        return this.totalPauseTime + (currentPauseTime / 1000);
    }

    toJSON()
    {
        return {
            name: this.name,
            state: this.state,
            type: this.type,

            endReason: this.endReason,
    
            isEnabled: this.isEnabled,
            duration: this.duration + this.overallPausedTime,

            progress: this.progress,
        
            runAmount: this.runAmount,
            runCount: this.runCount,

            startBlocks: this.startBlocks,
            endBlocks: this.endBlocks,
            
            blocks: this.blocks
        }
    }
}