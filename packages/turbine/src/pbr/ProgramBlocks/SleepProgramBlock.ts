import { EPBRMode } from "@metalizz/nuster-typings/src/spec/cycle/IProgramBlockRunner";
import { EProgramStepState } from "@metalizz/nuster-typings/src/spec/cycle/IProgramStep";
import { ISleepProgramBlock } from "@metalizz/nuster-typings/src/spec/cycle/programblocks/ProgramBlocks/ISleepProgramBlock";
import { LoggerInstance } from "../../app";
import { CycleController } from "../../controllers/cycle/CycleController";
import { NumericParameterBlocks } from "../ParameterBlocks";
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
        const pbrInstance = CycleController.getInstance().program;

        if(pbrInstance !== undefined)
        {
            const sleepTime = this.params[0].data();
            LoggerInstance.info(`SleepBlock: Will sleep for ${sleepTime * 1000} ms.`);
    
            for (let i = 0; i < ((sleepTime * 1000) / 10); i++)
            {
                if ([EProgramStepState.ENDING, EProgramStepState.ENDED].includes(pbrInstance.currentRunningStep?.state) || [EPBRMode.ENDED, EPBRMode.ENDING].includes(pbrInstance.status.mode))
                    return;
                else
                    await new Promise(resolve => { setTimeout(resolve, 10); });
            }
            this.executed = true;
        }
        else
            throw new PBRMissingError("SleepBlock");
    }
}


