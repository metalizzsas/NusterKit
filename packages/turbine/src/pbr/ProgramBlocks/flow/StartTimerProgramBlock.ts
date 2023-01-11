import type { NumericParameterBlockHydrated, StringParameterBlockHydrated } from "@metalizzsas/nuster-typings/build/hydrated/cycle/blocks/ParameterBlockHydrated";
import { ProgramBlockHydrated } from "@metalizzsas/nuster-typings/build/hydrated/cycle/blocks/ProgramBlockHydrated";
import type { AllProgramBlocks, StartTimerProgramBlock as StartTimerProgramBlockSpec } from "@metalizzsas/nuster-typings/build/spec/cycle/blocks/ProgramBlocks";
import { ParameterBlockRegistry } from "../../ParameterBlocks/ParameterBlockRegistry";
import { ProgramBlockRegistry } from "../ProgramBlockRegistry";
import { TurbineEventLoop } from "../../../events";

export class StartTimerProgramBlock extends ProgramBlockHydrated
{
    executed = false;

    timerName: StringParameterBlockHydrated;
    timerInterval: NumericParameterBlockHydrated;
    blocks: Array<ProgramBlockHydrated>;

    constructor(obj: StartTimerProgramBlockSpec)
    {
        super(obj);
        this.timerName = ParameterBlockRegistry.String(obj.start_timer.timer_name);
        this.timerInterval = ParameterBlockRegistry.Numeric(obj.start_timer.timer_interval);

        this.blocks = obj.start_timer.blocks.map(k => ProgramBlockRegistry(k));

        TurbineEventLoop.on(`pbr.stop`, () => this.earlyExit = true);
    }

    public async execute(): Promise<void> {
        
        if (this.earlyExit === true)
            return;

        const timerName = this.timerName.data;
        const timerInterval = this.timerInterval.data;

        const timer = setInterval(async () => {
            for (const b of this.blocks) {
                await b.execute();
            }
        }, timerInterval * 1000);

        TurbineEventLoop.emit("log", "info", `StartTimerBlock: Will start timer with name: ${timerName} and interval: ${timerInterval * 1000} ms.`)
        TurbineEventLoop.emit("pbr.timer.start", { name: timerName, timer: timer, enabled: true });

        super.execute();
    }

    static isStartTimerPgB(obj: AllProgramBlocks): obj is StartTimerProgramBlockSpec
    {
        return (obj as StartTimerProgramBlockSpec).start_timer !== undefined;
    }
}