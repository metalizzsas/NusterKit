import { ProgramBlockRegistry } from "../ProgramBlockRegistry";
import { ParameterBlockRegistry } from "../../ParameterBlocks/ParameterBlockRegistry";
import type { AllProgramBlocks, IfProgramBlock as IfProgramBlockSpec } from "$types/spec/cycle/program";
import type { Comparators } from "$types/spec/cycle/parameter";
import type { NumericParameterBlockHydrated, StringParameterBlockHydrated } from "$types/hydrated/cycle/blocks/ParameterBlockHydrated";
import ComparativeFunctions from "../../utils/ComparativeFunctions";
import { TurbineEventLoop } from "../../../events";
import { ProgramBlock } from "../ProgramBlock";

export class IfProgramBlock extends ProgramBlock
{
    comparator: StringParameterBlockHydrated;

    leftSide: NumericParameterBlockHydrated;
    rightSide: NumericParameterBlockHydrated;

    trueBlocks: Array<ProgramBlock>
    falseBlocks: Array<ProgramBlock> | undefined;

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

    public async execute(signal?: AbortSignal)
    {
        const left = this.leftSide.data;
        const right = this.rightSide.data;
        const comparator = this.comparator.data as Comparators;

        TurbineEventLoop.emit("log", "info", `IfBlock: Will compare ${left} and ${right} by ${comparator}`);

        if (ComparativeFunctions[comparator](left, right))
        {
            for(const tB of this.trueBlocks)
            {
                await tB.execute(signal);
            }
        }

        else if(this.falseBlocks !== undefined)
        {
            for(const fB of this.falseBlocks)
            {
                await fB.execute(signal);
            }
        }

        super.execute();
    }

    static isIfPgB(obj: AllProgramBlocks): obj is IfProgramBlockSpec
    {
        return (obj as IfProgramBlockSpec).if !== undefined;
    }
}