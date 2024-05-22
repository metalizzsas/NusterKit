import type { NumericParameterBlockHydrated, StringParameterBlockHydrated } from "$types/hydrated/cycle/blocks/ParameterBlockHydrated";
import type { AllProgramBlocks, StartTimerProgramBlock as StartTimerProgramBlockSpec } from "$types/spec/cycle/program";
import { ParameterBlockRegistry } from "../../ParameterBlocks/ParameterBlockRegistry";
import { ProgramBlockRegistry } from "../ProgramBlockRegistry";
import { TurbineEventLoop } from "../../../events";
import { ProgramBlock } from "../ProgramBlock";

export class StartTimerProgramBlock extends ProgramBlock
{
    executed = false;

    timerName: StringParameterBlockHydrated;
    timerInterval: NumericParameterBlockHydrated;
    blocks: Array<ProgramBlock>;

    constructor(obj: StartTimerProgramBlockSpec)
    {
        super(obj);
        this.timerName = ParameterBlockRegistry.String(obj.start_timer.timer_name);
        this.timerInterval = ParameterBlockRegistry.Numeric(obj.start_timer.timer_interval);

        this.blocks = obj.start_timer.blocks.map(k => ProgramBlockRegistry(k));
    }

    public async execute(): Promise<void> {
        
        if (this.earlyExit === true)
            return;

        const timerName = this.timerName.data;
        const timerInterval = this.timerInterval.data;

        TurbineEventLoop.emit("pbr.timer.exists", { timerName, callback: (exists: boolean) => {
            if (exists === true)
            {
                TurbineEventLoop.emit("log", "info", `StartTimerBlock: Will not start timer with name: ${timerName} because it already exists.`)
                return;
            }
            
            const timer = setInterval(async () => {
                if(!this.paused)
                {
                    for (const b of this.blocks) {
                        await b.execute();
                    }
                }
            }, timerInterval * 1000);
    
            TurbineEventLoop.emit("log", "info", `StartTimerBlock: Will start timer with name: ${timerName} and interval: ${timerInterval * 1000} ms.`)
            TurbineEventLoop.emit("pbr.timer.start", { name: timerName, timer: timer, enabled: true });
    
        }});

        super.execute();
    }

    static isStartTimerPgB(obj: AllProgramBlocks): obj is StartTimerProgramBlockSpec
    {
        return (obj as StartTimerProgramBlockSpec).start_timer !== undefined;
    }
}