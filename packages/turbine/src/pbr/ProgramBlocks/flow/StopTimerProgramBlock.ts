import type { StringParameterBlockHydrated } from "@metalizzsas/nuster-typings/build/hydrated/cycle/blocks/ParameterBlockHydrated";
import type { AllProgramBlocks, StopTimerProgramBlock as StopTimerProgramBlockSpec } from "@metalizzsas/nuster-typings/build/spec/cycle/blocks/ProgramBlocks";
import { ParameterBlockRegistry } from "../../ParameterBlocks/ParameterBlockRegistry";
import { TurbineEventLoop } from "../../../events";
import { ProgramBlock } from "../ProgramBlock";

export class StopTimerProgramBlock extends ProgramBlock
{
    timerName: StringParameterBlockHydrated;

    constructor(obj: StopTimerProgramBlockSpec)
    {
        super(obj);

        this.timerName = ParameterBlockRegistry.String(obj.stop_timer);
    }

    public async execute(): Promise<void> {

        const timerName = this.timerName.data;

        TurbineEventLoop.emit("log", "info", `StopTimerBlock: Will stop timer with name: ${timerName}`);

        await new Promise<void>(resolve => {

            TurbineEventLoop.emit('pbr.timer.stop', { timerName, callback: (stopped) => {
                if(stopped == false)
                    TurbineEventLoop.emit("log", "warning", `StopTimerBlock: Timer ${timerName} has not been found, ignoring.`)
                resolve();
            }});
        });

        super.execute();
    }

    static isStopTimerPgB(obj: AllProgramBlocks): obj is StopTimerProgramBlockSpec
    {
        return (obj as StopTimerProgramBlockSpec).stop_timer !== undefined;
    }
}