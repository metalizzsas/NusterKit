import { ProgramBlock, ProgramBlocks } from "./index";
import { ProgramBlockRegistry } from "./ProgramBlockRegistry";
import { NumericParameterBlocks, StringParameterBlocks } from "../ParameterBlocks";
import { ParameterBlockRegistry } from "../ParameterBlocks/ParameterBlockRegistry";
import { LoggerInstance } from "../../app";
import { IIfProgramBlock } from "@metalizzsas/nuster-typings/src/spec/cycle/programblocks/ProgramBlocks/IIfProgramBlock";


export class IfProgramBlock extends ProgramBlock implements IIfProgramBlock
{
    name = "if" as const;

    params: [NumericParameterBlocks, StringParameterBlocks, NumericParameterBlocks];

    trueBlocks: ProgramBlocks[] = [];
    falseBlocks: ProgramBlocks[] = [];

    private operators: { [x: string]: (x: number, y: number) => boolean; } = {
        ">": (x: number, y: number) => x > y,
        "<": (x: number, y: number) => x < y,
        "==": (x: number, y: number) => x == y,
        "!=": (x: number, y: number) => x != y
    };

    constructor(obj: IIfProgramBlock)
    {
        super(obj);

        this.params = [
            ParameterBlockRegistry(obj.params[0]) as NumericParameterBlocks,
            ParameterBlockRegistry(obj.params[1]) as StringParameterBlocks,
            ParameterBlockRegistry(obj.params[2]) as NumericParameterBlocks
        ];

        for(const trueBlock of obj.trueBlocks)
        {
            this.trueBlocks.push(ProgramBlockRegistry(trueBlock));
        }

        for(const falseBlock of obj.falseBlocks)
        {
            this.falseBlocks.push(ProgramBlockRegistry(falseBlock));
        }
    }

    public async execute() {
        const left = (this.params[0].data());
        const right = (this.params[2].data());
        const comparator = (this.params[1].data());

        LoggerInstance.info(`IfBlock: Will compare ${left} and ${right} by ${comparator}`);

        if (this.operators[comparator](left, right)) {
            for(const tB of this.trueBlocks)
            {
                await tB.execute();
            }
        }

        else {
            for(const fB of this.falseBlocks)
            {
                await fB.execute();
            }
        }

        this.executed = true;
    }
    
    public toJSON()
    {
        return {
            name: this.name,

            params: this.params,
            blocks: this.blocks,

            trueBlocks: this.trueBlocks,
            falseBlocks: this.falseBlocks,

            executed: this.executed
        };
    }
}

