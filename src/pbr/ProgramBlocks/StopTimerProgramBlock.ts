import { ProgramBlockRunner } from "../ProgramBlockRunner";
import { ProgramBlock } from "./index";
import { IStopTimerProgramBlock } from "../../interfaces/programblocks/ProgramBlocks/IStopTimerProgramBlock";
import { StringParameterBlocks } from "../ParameterBlocks";
import { ParameterBlockRegistry } from "../ParameterBlocks/ParameterBlockRegistry";

export class StopTimerProgramBlock extends ProgramBlock implements IStopTimerProgramBlock
{
    name: "stopTimer" = "stopTimer";

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
            this.pbrInstance.machine.logger.info("StopTimerBlock: Will stop timer with name: " + tN);
        }

        else {
            this.pbrInstance.machine.logger.warn("StopTimerBlock: Timer " + tN + " has not been found, ignoring.");
        }
    }
}

