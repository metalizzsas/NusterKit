import type { StringParameterBlockHydrated } from "@metalizzsas/nuster-typings/build/hydrated/cycle/blocks/ParameterBlockHydrated";
import { ProgramBlockHydrated } from "@metalizzsas/nuster-typings/build/hydrated/cycle/blocks/ProgramBlockHydrated";
import type { AllProgramBlocks, StopTimerProgramBlock as StopTimerProgramBlockSpec } from "@metalizzsas/nuster-typings/build/spec/cycle/blocks/ProgramBlocks";
import { ParameterBlockRegistry } from "../../ParameterBlocks/ParameterBlockRegistry";
import { TurbineEventLoop } from "../../../events";

export class StopTimerProgramBlock extends ProgramBlockHydrated
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
            TurbineEventLoop.once(`pbr.timer.stopped.${timerName}`, () => {
                TurbineEventLoop.emit("log", "info", `StopTimerBlock: Timer ${timerName} has been stopped.`)
                resolve()
            });
            
            setTimeout(() => {
                TurbineEventLoop.emit("log", "warning", `StopTimerBlock: Timer ${timerName} has not been found, ignoring.`)
                resolve();
            }, 1000);

            TurbineEventLoop.emit(`pbr.timer.stop.${timerName}`);
        });

        super.execute();
    }

    static isStopTimerPgB(obj: AllProgramBlocks): obj is StopTimerProgramBlockSpec
    {
        return (obj as StopTimerProgramBlockSpec).stop_timer !== undefined;
    }
}