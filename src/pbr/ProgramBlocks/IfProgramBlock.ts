import { ProgramBlockRunner } from "../ProgramBlockRunner";
import { IIfProgramBlock } from "../../interfaces/programblocks/ProgramBlocks/IIfProgramBlock";
import { ProgramBlock, ProgramBlocks } from "./index";
import { ProgramBlockRegistry } from "./ProgramBlockRegistry";
import { NumericParameterBlocks, StringParameterBlocks } from "../ParameterBlocks";
import { ParameterBlockRegistry } from "../ParameterBlocks/ParameterBlockRegistry";


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

    constructor(pbrInstance: ProgramBlockRunner, obj: IIfProgramBlock)
    {
        super(pbrInstance, obj);

        this.params = [
            ParameterBlockRegistry(pbrInstance, obj.params[0]) as NumericParameterBlocks,
            ParameterBlockRegistry(pbrInstance, obj.params[1]) as StringParameterBlocks,
            ParameterBlockRegistry(pbrInstance, obj.params[2]) as NumericParameterBlocks
        ];

        for(const tB of obj.trueBlocks)
        {
            this.trueBlocks.push(ProgramBlockRegistry(pbrInstance, tB));
        }

        for(const fB of obj.falseBlocks)
        {
            this.falseBlocks.push(ProgramBlockRegistry(pbrInstance, fB));
        }
    }

    public async execute() {
        const lV = (this.params[0].data());
        const rV = (this.params[2].data());
        const c = (this.params[1].data());

        this.pbrInstance.machine.logger.info(`IfBlock: Will compare ${lV} and ${rV} by ${c}`);

        if (this.operators[c](lV, rV)) {
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

