import { ProgramBlock, ProgramBlocks } from "./index";
import { StringParameterBlocks, NumericParameterBlocks } from "../ParameterBlocks";
import { ParameterBlockRegistry } from "../ParameterBlocks/ParameterBlockRegistry";
import { LoggerInstance } from "../../app";
import { CycleController } from "../../controllers/cycle/CycleController";
import { PBRMissingError } from "../PBRMissingError";
import { IStartTimerProgramBlock } from "@metalizzsas/nuster-typings/build/spec/cycle/programblocks/ProgramBlocks/IStartTimerProgramBlock";
import { EPBRMode } from "@metalizzsas/nuster-typings/build/spec/cycle/IProgramBlockRunner";


export class StartTimerProgramBlock extends ProgramBlock implements IStartTimerProgramBlock
{
    name = "startTimer" as const;

    params: [
        StringParameterBlocks,
        NumericParameterBlocks
    ];

    blocks: ProgramBlocks[] = []

    constructor(obj: IStartTimerProgramBlock)
    {
        super(obj);

        this.params = [
            ParameterBlockRegistry(obj.params[0]) as StringParameterBlocks,
            ParameterBlockRegistry(obj.params[1]) as NumericParameterBlocks
        ];

        super.fillProgramBlocks(obj);
    }

    public async execute(): Promise<void> {

        const pbrInstance = CycleController.getInstance().program;

        if(pbrInstance !== undefined)
        {
            if (pbrInstance.status.mode == EPBRMode.ENDED)
                return;
    
            const tN = this.params[0].data();
            const tI = this.params[1].data();
    
            const timer = setInterval(async () => {
                for (const b of this.blocks) {
                    await b.execute();
                }
            }, tI * 1000);
            LoggerInstance.info("StartTimerBlock: Will start timer with name: " + tN + " and interval: " + tI * 1000 + " ms.");
            pbrInstance.timers.push({ name: tN, timer: timer, blocks: this.blocks, enabled: true });
    
            this.executed = true;
        }
        else
            throw new PBRMissingError("StartTimeBlock");
    }
}

