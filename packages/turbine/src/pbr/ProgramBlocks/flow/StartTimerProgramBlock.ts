import type { NumericParameterBlockHydrated, StringParameterBlockHydrated } from "@metalizzsas/nuster-typings/build/hydrated/cycle/blocks/ParameterBlockHydrated";
import { ProgramBlockHydrated } from "@metalizzsas/nuster-typings/build/hydrated/cycle/blocks/ProgramBlockHydrated";
import type { AllProgramBlocks, StartTimerProgramBlock as StartTimerProgramBlockSpec } from "@metalizzsas/nuster-typings/build/spec/cycle/IProgramBlocks";
import { LoggerInstance } from "../../../app";
import { ParameterBlockRegistry } from "../../ParameterBlocks/ParameterBlockRegistry";
import { PBRMissingError } from "../../PBRMissingError";
import type { ProgramBlockRunner } from "../../ProgramBlockRunner";
import { ProgramBlockRegistry } from "../ProgramBlockRegistry";

export class StartTimerProgramBlock extends ProgramBlockHydrated
{
    executed = false;

    timerName: StringParameterBlockHydrated;
    timerInterval: NumericParameterBlockHydrated;
    blocks: Array<ProgramBlockHydrated>;

    pbrInstance?: ProgramBlockRunner;

    constructor(obj: StartTimerProgramBlockSpec, pbrInstance?: ProgramBlockRunner)
    {
        super(obj, pbrInstance);
        this.timerName = ParameterBlockRegistry.String(obj.start_timer.timer_name);
        this.timerInterval = ParameterBlockRegistry.Numeric(obj.start_timer.timer_interval);

        this.blocks = obj.start_timer.blocks.map(k => ProgramBlockRegistry(k));
    }

    public async execute(): Promise<void> {

        if(this.pbrInstance === undefined)
            throw new PBRMissingError("StartTimeBlock");
        
        if (this.pbrInstance.status.mode == "ended")
            return;

        const timerName = this.timerName.data;
        const timerInterval = this.timerInterval.data;

        const timer = setInterval(async () => {
            for (const b of this.blocks) {
                await b.execute();
            }
        }, timerInterval * 1000);
        LoggerInstance.info("StartTimerBlock: Will start timer with name: " + timerName + " and interval: " + timerInterval * 1000 + " ms.");
        this.pbrInstance.timers.push({ name: timerName, timer: timer, enabled: true });

        super.execute();
    }

    static isStartTimerPgB(obj: AllProgramBlocks): obj is StartTimerProgramBlockSpec
    {
        return (obj as StartTimerProgramBlockSpec).start_timer !== undefined;
    }
}