import { IConditionalParameterBlock } from "@metalizz/nuster-typings/src/spec/cycle/programblocks/ParameterBlocks/IConditionalParameterBlock";
import { NumericParameterBlocks, ParameterBlock, StringParameterBlocks } from ".";
import { ParameterBlockRegistry } from "./ParameterBlockRegistry";

export class ConditionalParameterBlock extends ParameterBlock implements IConditionalParameterBlock
{
    name = "conditional" as const;
    value: ">" | "<" | "==" | "!=";

    params: [
        NumericParameterBlocks,
        NumericParameterBlocks,
        NumericParameterBlocks | StringParameterBlocks,
        NumericParameterBlocks | StringParameterBlocks
    ];

    private operators: {[x: string]: (x: number, y: number) => boolean; } = {
        ">": (x: number, y: number) => x > y,
        "<": (x: number, y: number) => x < y,
        "==": (x: number, y: number) => x == y,
        "!=": (x: number, y: number) => x != y
    };

    constructor(obj: IConditionalParameterBlock)
    {
        super(obj);

        this.value = obj.value;

        this.params = [
            ParameterBlockRegistry(obj.params[0]) as NumericParameterBlocks,
            ParameterBlockRegistry(obj.params[1]) as NumericParameterBlocks,
            ParameterBlockRegistry(obj.params[2]) as NumericParameterBlocks | StringParameterBlocks,
            ParameterBlockRegistry(obj.params[3]) as NumericParameterBlocks | StringParameterBlocks
        ];

    }

    //return param 2 if condition between param 0 and param 1 is true else it returns params 3
    data(): number
    {
        if(this.params.length != 4) return 0; //if param count doesnt match for this block return 0
        
        return (this.operators[this.value as string](this.params[0].data() as number, this.params[1].data() as number)) ? this.params[2].data() as number : this.params[3].data() as number;
    }
}

