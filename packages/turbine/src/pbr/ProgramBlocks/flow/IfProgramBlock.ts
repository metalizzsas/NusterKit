import { ProgramBlockRegistry } from "../ProgramBlockRegistry";
import { ParameterBlockRegistry } from "../../ParameterBlocks/ParameterBlockRegistry";
import { LoggerInstance } from "../../../app";
import { ProgramBlockHydrated } from "@metalizzsas/nuster-typings/build/hydrated/cycle/blocks/ProgramBlockHydrated";
import type { AllProgramBlocks, IfProgramBlock as IfProgramBlockSpec } from "@metalizzsas/nuster-typings/build/spec/cycle/IProgramBlocks";
import type { Comparators } from "@metalizzsas/nuster-typings/build/spec/cycle/IParameterBlocks";
import type { NumericParameterBlockHydrated, StringParameterBlockHydrated } from "@metalizzsas/nuster-typings/build/hydrated/cycle/blocks/ParameterBlockHydrated";
import ComparativeFunctions from "../../ComparativeFunctions";

export class IfProgramBlock extends ProgramBlockHydrated
{
    comparator: StringParameterBlockHydrated;

    leftSide: NumericParameterBlockHydrated;
    rightSide: NumericParameterBlockHydrated;

    trueBlocks: Array<ProgramBlockHydrated>
    falseBlocks: Array<ProgramBlockHydrated> | undefined;

    constructor(obj: IfProgramBlockSpec)
    {
        super(obj);
        this.comparator = ParameterBlockRegistry.String(obj.if.statement.comparator);
        this.leftSide = ParameterBlockRegistry.Numeric(obj.if.statement.left_side);
        this.rightSide =  ParameterBlockRegistry.Numeric(obj.if.statement.right_side);

        this.trueBlocks = obj.if.true_blocks.map(k => ProgramBlockRegistry(k));

        if(obj.if.false_blocks)
            this.falseBlocks = obj.if.false_blocks?.map(k => ProgramBlockRegistry(k));
        else
            this.falseBlocks = [];

        // Estimate run time from conditions
        if(ComparativeFunctions[this.comparator.data as Comparators](this.leftSide.data, this.rightSide.data))
            this.estimatedRunTime = this.trueBlocks.reduce((p, c) => p + c.estimatedRunTime, 0);
        else
            this.estimatedRunTime = this.falseBlocks.reduce((p, c) => p + c.estimatedRunTime, 0);
    }

    public async execute()
    {
        const left = this.leftSide.data;
        const right = this.rightSide.data;
        const comparator = this.comparator.data as Comparators;

        LoggerInstance.info(`IfBlock: Will compare ${left} and ${right} by ${comparator}`);

        if (ComparativeFunctions[comparator](left, right))
        {
            for(const tB of this.trueBlocks)
            {
                await tB.execute();
            }
        }

        else if(this.falseBlocks !== undefined)
        {
            for(const fB of this.falseBlocks)
            {
                await fB.execute();
            }
        }

        super.execute();
    }

    static isIfPgB(obj: AllProgramBlocks): obj is IfProgramBlockSpec
    {
        return (obj as IfProgramBlockSpec).if !== undefined;
    }
}