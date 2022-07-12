import { EPBRMode } from "../../interfaces/IProgramBlockRunner";
import { IWhileLoopProgramBlock } from "../../interfaces/programblocks/ProgramBlocks/IWhileLoopProgramBlock";
import { NumericParameterBlocks, StringParameterBlocks } from "../ParameterBlocks";
import { ParameterBlockRegistry } from "../ParameterBlocks/ParameterBlockRegistry";
import { ProgramBlockRunner } from "../ProgramBlockRunner";
import { ProgramBlock, ProgramBlocks } from "./index";

export class WhileLoopProgramBlock extends ProgramBlock implements IWhileLoopProgramBlock
{
    name: "while" = "while";

    params: [NumericParameterBlocks, StringParameterBlocks, NumericParameterBlocks];
    blocks: ProgramBlocks[] = [];

    private operators: { [x: string]: (x: number, y: number) => boolean; } = {
        ">": (x: number, y: number) => x > y,
        "<": (x: number, y: number) => x < y,
        "==": (x: number, y: number) => x == y,
        "!=": (x: number, y: number) => x != y
    };

    constructor(pbrInstance: ProgramBlockRunner, obj: IWhileLoopProgramBlock)
    {
        super(pbrInstance, obj);

       this.params = [
            ParameterBlockRegistry(pbrInstance, obj.params[0]) as NumericParameterBlocks,
            ParameterBlockRegistry(pbrInstance, obj.params[1]) as StringParameterBlocks,
            ParameterBlockRegistry(pbrInstance, obj.params[2]) as NumericParameterBlocks,
        ];

        super.fillProgramBlocks(obj);
    }

    public async execute(): Promise<void> {
        while (this.operators[this.params[1].data() as string](this.params[0].data() as number, this.params[2].data() as number)) {
            if (this.pbrInstance.status.mode == EPBRMode.ENDED) {
                this.executed = true;
                return;
            }

            for (const b of this.blocks) {
                await b.execute();
            }
        }
    }
}


