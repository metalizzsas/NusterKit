import type { StringParameterBlockHydrated } from "@metalizzsas/nuster-typings/build/hydrated/cycle/blocks/ParameterBlockHydrated";
import { ProgramBlockHydrated } from "@metalizzsas/nuster-typings/build/hydrated/cycle/blocks/ProgramBlockHydrated";
import type { AllProgramBlocks, StopTimerProgramBlock as StopTimerProgramBlockSpec } from "@metalizzsas/nuster-typings/build/spec/cycle/IProgramBlocks";
import { LoggerInstance } from "../../../app";
import { ParameterBlockRegistry } from "../../ParameterBlocks/ParameterBlockRegistry";
import { PBRMissingError } from "../../PBRMissingError";
import type { ProgramBlockRunner } from "../../ProgramBlockRunner";

export class StopTimerProgramBlock extends ProgramBlockHydrated
{
    timerName: StringParameterBlockHydrated;

    constructor(obj: StopTimerProgramBlockSpec, pbrInstance?: ProgramBlockRunner)
    {
        super(obj, pbrInstance);

        this.timerName = ParameterBlockRegistry.String(obj.stop_timer);
    }

    public async execute(): Promise<void> {

        if(this.pbrInstance === undefined)
            throw new PBRMissingError("StopTimer");

        const timerName = this.timerName.data;

        const timerIndex = this.pbrInstance.timers.findIndex((t) => t.name == timerName);
        const timer = this.pbrInstance.timers.at(timerIndex);

        if (timer && timer.timer && timer.enabled) {
            clearInterval(timer.timer);
            timer.enabled = false;
            this.pbrInstance.timers.splice(timerIndex, 1); // remove timer from pbr instance
            LoggerInstance.info("StopTimerBlock: Will stop timer with name: " + timerName);
        }

        else {
            LoggerInstance.warn("StopTimerBlock: Timer " + timerName + " has not been found, ignoring.");
        }

        super.execute();
    }

    static isStopTimerPgB(obj: AllProgramBlocks): obj is StopTimerProgramBlockSpec
    {
        return (obj as StopTimerProgramBlockSpec).stop_timer !== undefined;
    }
}