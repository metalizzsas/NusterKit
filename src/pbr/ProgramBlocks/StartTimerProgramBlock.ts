import { EPBRMode } from "../../interfaces/IProgramBlockRunner";
import { ProgramBlockRunner } from "../ProgramBlockRunner";
import { ProgramBlock, ProgramBlocks } from "./index";
import { IStartTimerProgramBlock } from "../../interfaces/programblocks/ProgramBlocks/IStartTimerProgramBlock";
import { StringParameterBlocks, NumericParameterBlocks } from "../ParameterBlocks";
import { ParameterBlockRegistry } from "../ParameterBlocks/ParameterBlockRegistry";


export class StartTimerProgramBlock extends ProgramBlock implements IStartTimerProgramBlock
{
    name = "startTimer" as const;

    params: [
        StringParameterBlocks,
        NumericParameterBlocks
    ];

    blocks: ProgramBlocks[] = []

    constructor(pbrInstance: ProgramBlockRunner, obj: IStartTimerProgramBlock)
    {
        super(pbrInstance, obj);

        this.params = [
            ParameterBlockRegistry(pbrInstance, obj.params[0]) as StringParameterBlocks,
            ParameterBlockRegistry(pbrInstance, obj.params[1]) as NumericParameterBlocks
        ];

        super.fillProgramBlocks(obj);
    }

    public async execute(): Promise<void> {

        if (this.pbrInstance.status.mode == EPBRMode.ENDED)
            return;

        const tN = this.params[0].data();
        const tI = this.params[1].data();

        const timer = setInterval(async () => {
            for (const b of this.blocks) {
                await b.execute();
            }
        }, tI * 1000);
        this.pbrInstance.machine.logger.info("StartTimerBlock: Will start timer with name: " + tN + " and interval: " + tI * 1000 + " ms.");
        this.pbrInstance.timers.push({ name: tN, timer: timer, blocks: this.blocks, enabled: true });

        this.executed = false;
    }
}

