import { EPBRMode } from "../../interfaces/IProgramBlockRunner";
import { ProgramBlock } from "./index";
import { ISleepProgramBlock } from "../../interfaces/programblocks/ProgramBlocks/ISleepProgramBlock";
import { NumericParameterBlocks } from "../ParameterBlocks";
import { ParameterBlockRegistry } from "../ParameterBlocks/ParameterBlockRegistry";
import { LoggerInstance } from "../../app";
import { CycleController } from "../../controllers/cycle/CycleController";
import { PBRMissingError } from "../PBRMissingError";


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
                //TODO: Use Current step status to handle Next step correctly
                if (pbrInstance.status.mode != EPBRMode.ENDED)
                    await new Promise(resolve => {
                        setTimeout(resolve, 10);
                    });
    
                else
                    return;
            }
            this.executed = true;
        }
        else
            throw new PBRMissingError("SleepBlock");
    }
}


