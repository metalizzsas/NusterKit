import type { NumericParameterBlockHydrated, StringParameterBlockHydrated } from "@metalizzsas/nuster-typings/build/hydrated/cycle/blocks/ParameterBlockHydrated";
import { ProgramBlockHydrated } from "@metalizzsas/nuster-typings/build/hydrated/cycle/blocks/ProgramBlockHydrated";
import type { Comparators } from "@metalizzsas/nuster-typings/build/spec/cycle/IParameterBlocks";
import type { AllProgramBlocks, WhileProgramBlock as WhileProgramBlockSpec } from "@metalizzsas/nuster-typings/build/spec/cycle/IProgramBlocks";
import ComparativeFunctions from "../../ComparativeFunctions";
import { ParameterBlockRegistry } from "../../ParameterBlocks/ParameterBlockRegistry";
import { PBRMissingError } from "../../PBRMissingError";
import type { ProgramBlockRunner } from "../../ProgramBlockRunner";
import { ProgramBlockRegistry } from "../ProgramBlockRegistry";

export class WhileProgramBlock extends ProgramBlockHydrated
{
    comparator: StringParameterBlockHydrated;
    leftSide: NumericParameterBlockHydrated;
    rightSide: NumericParameterBlockHydrated;

    blocks: Array<ProgramBlockHydrated>;

    constructor(obj: WhileProgramBlockSpec, pbrInstance?: ProgramBlockRunner)
    {
        super(obj, pbrInstance);
        this.comparator = ParameterBlockRegistry.String(obj.while.statement.comparator);

        this.leftSide = ParameterBlockRegistry.Numeric(obj.while.statement.left_side);
        this.rightSide = ParameterBlockRegistry.Numeric(obj.while.statement.right_side);

        this.blocks = obj.while.blocks.map(k => ProgramBlockRegistry(k));

        // While loop has an infinity runTime because it cannot be determined
        this.estimatedRunTime = Infinity;
    }

    public async execute(): Promise<void>
    {
        if(this.pbrInstance === undefined)
            throw new PBRMissingError("WhileLoop");
        
        while (ComparativeFunctions[this.comparator.data as Comparators](this.leftSide.data, this.rightSide.data))
        {
            if (["ending", "ended"].includes(this.pbrInstance.currentRunningStep?.state) || ["ended", "ending"].includes(this.pbrInstance.status.mode))
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