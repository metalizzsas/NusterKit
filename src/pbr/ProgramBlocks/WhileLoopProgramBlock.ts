import { CycleController } from "../../controllers/cycle/CycleController";
import { EPBRMode } from "../../interfaces/IProgramBlockRunner";
import { EProgramStepState } from "../../interfaces/IProgramStep";
import { IWhileLoopProgramBlock } from "../../interfaces/programblocks/ProgramBlocks/IWhileLoopProgramBlock";
import { NumericParameterBlocks, StringParameterBlocks } from "../ParameterBlocks";
import { ParameterBlockRegistry } from "../ParameterBlocks/ParameterBlockRegistry";
import { PBRMissingError } from "../PBRMissingError";
import { ProgramBlock, ProgramBlocks } from "./index";

export class WhileLoopProgramBlock extends ProgramBlock implements IWhileLoopProgramBlock
{
    name = "while" as const;

    params: [NumericParameterBlocks, StringParameterBlocks, NumericParameterBlocks];
    blocks: ProgramBlocks[] = [];

    private operators: { [x: string]: (x: number, y: number) => boolean; } = {
        ">": (x: number, y: number) => x > y,
        "<": (x: number, y: number) => x < y,
        "==": (x: number, y: number) => x == y,
        "!=": (x: number, y: number) => x != y
    };

    constructor(obj: IWhileLoopProgramBlock)
    {
        super(obj);

       this.params = [
            ParameterBlockRegistry(obj.params[0]) as NumericParameterBlocks,
            ParameterBlockRegistry(obj.params[1]) as StringParameterBlocks,
            ParameterBlockRegistry(obj.params[2]) as NumericParameterBlocks,
        ];

        super.fillProgramBlocks(obj);
    }

    public async execute(): Promise<void> {

        const pbrInstance = CycleController.getInstance().program;

        if(pbrInstance !== undefined) 
        {
            while (this.operators[this.params[1].data() as string](this.params[0].data() as number, this.params[2].data() as number))
            {
                if ([EProgramStepState.ENDING, EProgramStepState.ENDED].includes(pbrInstance.currentRunningStep?.state) || [EPBRMode.ENDED, EPBRMode.ENDING].includes(pbrInstance.status.mode))
                { 
                    this.executed = true;
                    return;
                }
                for (const b of this.blocks)
                {
                    await b.execute();
                }
            }
        }
        else
            throw new PBRMissingError("WhileLoop");
    }
}


