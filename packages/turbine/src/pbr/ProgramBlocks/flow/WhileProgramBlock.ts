import type { NumericParameterBlockHydrated, StringParameterBlockHydrated } from "@metalizzsas/nuster-typings/build/hydrated/cycle/blocks/ParameterBlockHydrated";
import { ProgramBlockHydrated } from "@metalizzsas/nuster-typings/build/hydrated/cycle/blocks/ProgramBlockHydrated";
import type { Comparators } from "@metalizzsas/nuster-typings/build/spec/cycle/blocks/ParameterBlocks";
import type { AllProgramBlocks, WhileProgramBlock as WhileProgramBlockSpec } from "@metalizzsas/nuster-typings/build/spec/cycle/blocks/ProgramBlocks";
import ComparativeFunctions from "../../ComparativeFunctions";
import { ParameterBlockRegistry } from "../../ParameterBlocks/ParameterBlockRegistry";
import { ProgramBlockRegistry } from "../ProgramBlockRegistry";
import { TurbineEventLoop } from "../../../events";

export class WhileProgramBlock extends ProgramBlockHydrated
{
    comparator: StringParameterBlockHydrated;
    leftSide: NumericParameterBlockHydrated;
    rightSide: NumericParameterBlockHydrated;

    blocks: Array<ProgramBlockHydrated>;

    constructor(obj: WhileProgramBlockSpec)
    {
        super(obj);
        this.comparator = ParameterBlockRegistry.String(obj.while.statement.comparator);

        this.leftSide = ParameterBlockRegistry.Numeric(obj.while.statement.left_side);
        this.rightSide = ParameterBlockRegistry.Numeric(obj.while.statement.right_side);

        this.blocks = obj.while.blocks.map(k => ProgramBlockRegistry(k));

        // While loop has an infinity runTime because it cannot be determined
        this.estimatedRunTime = Infinity;

        TurbineEventLoop.on(`pbr.stop`, () => this.earlyExit = true);
    }

    public async execute(): Promise<void>
    {        
        while (ComparativeFunctions[this.comparator.data as Comparators](this.leftSide.data, this.rightSide.data))
        {
            if (this.earlyExit === true)
            { 
                this.executed = true;
                return;
            }
            for (const b of this.blocks)
            {
                await b.execute();
            }
        }

        super.execute();
    }

    static isWhilePgB(obj: AllProgramBlocks): obj is WhileProgramBlockSpec
    {
        return (obj as WhileProgramBlockSpec).while !== undefined;
    }
}