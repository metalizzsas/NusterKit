import type { IStopTimerProgramBlock } from "@metalizzsas/nuster-typings/build/spec/cycle/programblocks/ProgramBlocks/IStopTimerProgramBlock";
import { LoggerInstance } from "../../app";
import { CycleController } from "../../controllers/cycle/CycleController";
import type { StringParameterBlocks } from "../ParameterBlocks";
import { ParameterBlockRegistry } from "../ParameterBlocks/ParameterBlockRegistry";
import { PBRMissingError } from "../PBRMissingError";
import { ProgramBlock } from "./index";

export class StopTimerProgramBlock extends ProgramBlock implements IStopTimerProgramBlock
{
    name = "stopTimer" as const;

    params: [StringParameterBlocks];

    constructor(obj: IStopTimerProgramBlock)
    {
        super( obj);

        this.params = [
            ParameterBlockRegistry(obj.params[0]) as StringParameterBlocks
        ];
    }

    public async execute(): Promise<void> {

        const pbrInstance = CycleController.getInstance().program;

        if(pbrInstance !== undefined)
        {
            const timerName = this.params[0].data() as string;
    
            const timerIndex = pbrInstance.timers.findIndex((t) => t.name == timerName);
            const timer = pbrInstance.timers.at(timerIndex);
    
            if (timer && timer.timer && timer.enabled) {
                clearInterval(timer.timer);
                timer.enabled = false;
                pbrInstance.timers.splice(timerIndex, 1); // remove timer from pbr instance
                LoggerInstance.info("StopTimerBlock: Will stop timer with name: " + timerName);
            }
    
            else {
                LoggerInstance.warn("StopTimerBlock: Timer " + timerName + " has not been found, ignoring.");
            }
    
            this.executed = true;
        }
        else
            throw new PBRMissingError("StopTimer");
    }
}

