import type { NumericParameterBlockHydrated, StringParameterBlockHydrated } from "$types/hydrated/cycle/blocks/ParameterBlockHydrated";
import type { Comparators } from "$types/spec/cycle/parameter";
import type { AllProgramBlocks, WhileProgramBlock as WhileProgramBlockSpec } from "$types/spec/cycle/program";
import ComparativeFunctions from "../../utils/ComparativeFunctions";
import { ParameterBlockRegistry } from "../../ParameterBlocks/ParameterBlockRegistry";
import { ProgramBlockRegistry } from "../ProgramBlockRegistry";
import { ProgramBlock } from "../ProgramBlock";

export class WhileProgramBlock extends ProgramBlock
{
    comparator: StringParameterBlockHydrated;
    leftSide: NumericParameterBlockHydrated;
    rightSide: NumericParameterBlockHydrated;

    blocks: Array<ProgramBlock>;

    constructor(obj: WhileProgramBlockSpec)
    {
        super(obj);
        this.comparator = ParameterBlockRegistry.String(obj.while.comparison[1]);

        this.leftSide = ParameterBlockRegistry.Numeric(obj.while.comparison[0]);
        this.rightSide = ParameterBlockRegistry.Numeric(obj.while.comparison[2]);

        this.blocks = obj.while.blocks.map(k => ProgramBlockRegistry(k));

        // While loop has an infinity runTime because it cannot be determined
        this.estimatedRunTime = Infinity;
    }

    public async execute(signal?: AbortSignal): Promise<void>
    {        
        while (ComparativeFunctions[this.comparator.data as Comparators](this.leftSide.data, this.rightSide.data))
        {
            if (this.earlyExit === true || signal?.aborted === true)
            { 
                this.executed = true;
                return;
            }
            for (const b of this.blocks)
            {
                await b.execute(signal);
            }
        }

        super.execute();
    }

    static isWhilePgB(obj: AllProgramBlocks): obj is WhileProgramBlockSpec
    {
        return (obj as WhileProgramBlockSpec).while !== undefined;
    }
}