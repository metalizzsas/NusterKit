import type { ISleepProgramBlock } from "@metalizzsas/nuster-typings/build/spec/cycle/programblocks/ProgramBlocks/ISleepProgramBlock";
import type { NumericParameterBlocks } from "../ParameterBlocks";
import { LoggerInstance } from "../../app";
import { CycleController } from "../../controllers/cycle/CycleController";
import { ParameterBlockRegistry } from "../ParameterBlocks/ParameterBlockRegistry";
import { PBRMissingError } from "../PBRMissingError";
import { ProgramBlock } from "./index";


export class SleepProgramBlock extends ProgramBlock implements ISleepProgramBlock
{
    name = "sleep" as const;
    params: [NumericParameterBlocks];

    constructor(obj: ISleepProgramBlock) {
        super(obj);

        this.params = [
            ParameterBlockRegistry(obj.params[0]) as NumericParameterBlocks
        ];
    }

    public async execute(): Promise<void>
    {
        const pbrInstance = CycleController.getInstance().pbrInstance;

        if(pbrInstance !== undefined)
        {
            const sleepTime = this.params[0].data();
            LoggerInstance.info(`SleepBlock: Will sleep for ${sleepTime * 1000} ms.`);
    
            for (let i = 0; i < ((sleepTime * 1000) / 10); i++)
            {
                if (["ending", "ended"].includes(pbrInstance.currentRunningStep?.state) || ["ended", "ending"].includes(pbrInstance.status.mode))
                {
                    this.executed = true;
                    return;
                }
                else
                    await new Promise(resolve => { setTimeout(resolve, 10); });
            }
            this.executed = true;
        }
        else
            throw new PBRMissingError("SleepBlock");
    }
}


