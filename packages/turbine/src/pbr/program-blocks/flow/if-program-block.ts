import { ProgramBlockRegistry } from "../program-block-registry";
import { ParameterBlockRegistry } from "../../parameter-blocks/parameter-block-registry";
import type { AllProgramBlocks, IfProgramBlock as IfProgramBlockSpec } from "$types/spec/cycle/program";
import type { Comparators } from "$types/spec/cycle/parameter";
import type { NumericParameterBlockHydrated, StringParameterBlockHydrated } from "$types/hydrated/cycle/blocks/parameter-block-hydrated";
import type { PBRContext } from "../../../services/pbr-context";
import ComparativeFunctions from "../../utils/comparative-functions";
import { ProgramBlock } from "../program-block";

export class IfProgramBlock extends ProgramBlock {
    comparator: StringParameterBlockHydrated;

    leftSide: NumericParameterBlockHydrated;
    rightSide: NumericParameterBlockHydrated;

    trueBlocks: Array<ProgramBlock>;
    falseBlocks: Array<ProgramBlock>;

    constructor(obj: IfProgramBlockSpec, ctx: PBRContext) {
        super(obj, ctx);
        this.comparator = ParameterBlockRegistry.String(obj.if.comparison[1]);

        this.leftSide = ParameterBlockRegistry.Numeric(obj.if.comparison[0]);
        this.rightSide = ParameterBlockRegistry.Numeric(obj.if.comparison[2]);

        this.trueBlocks = obj.if.true_blocks.map(k => ProgramBlockRegistry(k, ctx));
        this.falseBlocks = obj.if.false_blocks?.map(k => ProgramBlockRegistry(k, ctx)) ?? [];

        if (ComparativeFunctions[this.comparator.data as Comparators](this.leftSide.data, this.rightSide.data))
            this.estimatedRunTime = this.trueBlocks.reduce((p, c) => p + c.estimatedRunTime, 0);
        else
            this.estimatedRunTime = this.falseBlocks.reduce((p, c) => p + c.estimatedRunTime, 0);
    }

    public async execute(signal?: AbortSignal) {
        const left = this.leftSide.data;
        const right = this.rightSide.data;
        const comparator = this.comparator.data as Comparators;

        this.ctx.logger.log("info", `IfBlock: Will compare ${left} and ${right} by ${comparator}`);

        if (ComparativeFunctions[comparator](left, right)) {
            for (const tB of this.trueBlocks) {
                await tB.execute(signal);
            }
        } else {
            for (const fB of this.falseBlocks) {
                await fB.execute(signal);
            }
        }

        super.execute();
    }

    dispose(): void {
        super.dispose();
        for (const b of this.trueBlocks) b.dispose();
        for (const b of this.falseBlocks) b.dispose();
    }

    static isIfPgB(obj: AllProgramBlocks): obj is IfProgramBlockSpec {
        return (obj as IfProgramBlockSpec).if !== undefined;
    }
}