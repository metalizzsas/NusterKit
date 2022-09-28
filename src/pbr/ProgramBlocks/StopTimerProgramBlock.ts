import { ProgramBlockRunner } from "../ProgramBlockRunner";
import { ProgramBlock } from "./index";
import { IStopTimerProgramBlock } from "../../interfaces/programblocks/ProgramBlocks/IStopTimerProgramBlock";
import { StringParameterBlocks } from "../ParameterBlocks";
import { ParameterBlockRegistry } from "../ParameterBlocks/ParameterBlockRegistry";
import { LoggerInstance } from "../../app";

export class StopTimerProgramBlock extends ProgramBlock implements IStopTimerProgramBlock
{
    name = "stopTimer" as const;

    params: [StringParameterBlocks];

    constructor(pbrInstance: ProgramBlockRunner, obj: IStopTimerProgramBlock)
    {
        super(pbrInstance, obj);

        this.params = [
            ParameterBlockRegistry(pbrInstance, obj.params[0]) as StringParameterBlocks
        ];
    }

    public async execute(): Promise<void> {
        const tN = this.params[0].data() as string;

        const timerIndex = this.pbrInstance.timers.findIndex((t) => t.name == tN);
        const timer = this.pbrInstance.timers.at(timerIndex);

        if (timer && timer.timer && timer.enabled) {
            clearInterval(timer.timer);
            timer.enabled = false;
            this.pbrInstance.timers.splice(timerIndex, 1); // remove timer from pbr instance
            LoggerInstance.info("StopTimerBlock: Will stop timer with name: " + tN);
        }

        else {
            LoggerInstance.warn("StopTimerBlock: Timer " + tN + " has not been found, ignoring.");
        }

        this.executed = true;
    }
}

