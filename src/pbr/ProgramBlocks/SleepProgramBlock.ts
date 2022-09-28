import { EPBRMode } from "../../interfaces/IProgramBlockRunner";
import { ProgramBlockRunner } from "../ProgramBlockRunner";
import { ProgramBlock } from "./index";
import { ISleepProgramBlock } from "../../interfaces/programblocks/ProgramBlocks/ISleepProgramBlock";
import { NumericParameterBlocks } from "../ParameterBlocks";
import { ParameterBlockRegistry } from "../ParameterBlocks/ParameterBlockRegistry";
import { LoggerInstance } from "../../app";


export class SleepProgramBlock extends ProgramBlock implements ISleepProgramBlock
{
    name = "sleep" as const;
    params: [NumericParameterBlocks];

    constructor(pbrInstance: ProgramBlockRunner, obj: ISleepProgramBlock) {
        super(pbrInstance, obj);

        this.params = [
            ParameterBlockRegistry(pbrInstance, obj.params[0]) as NumericParameterBlocks
        ];
    }

    public async execute(): Promise<void>
    {
        const sT = this.params[0].data();
        LoggerInstance.info(`SleepBlock: Will sleep for ${sT * 1000} ms.`);

        for (let i = 0; i < ((sT * 1000) / 10); i++) {
            if (this.pbrInstance.status.mode != EPBRMode.ENDED)
                await new Promise(resolve => {
                    setTimeout(resolve, 10);
                });

            else
                return;
        }
        this.executed = true;
    }
}


