import type { NumericParameterBlockHydrated } from "@metalizzsas/nuster-typings/build/hydrated/cycle/blocks/ParameterBlockHydrated";
import type { AllProgramBlocks, ForProgramBlock as ForProgramBlockSpec } from "@metalizzsas/nuster-typings/build/spec/cycle/blocks/ProgramBlocks";
import { ProgramBlockHydrated } from "@metalizzsas/nuster-typings/build/hydrated/cycle/blocks/ProgramBlockHydrated";
import { ParameterBlockRegistry } from "../../ParameterBlocks/ParameterBlockRegistry";
import { ProgramBlockRegistry } from "../ProgramBlockRegistry";
import { TurbineEventLoop } from "../../../events";

export class ForProgramBlock extends ProgramBlockHydrated {

    limit: NumericParameterBlockHydrated;
    blocks: Array<ProgramBlockHydrated>;

    currentIteration = 0;
    executed = false;

    constructor(obj: ForProgramBlockSpec)
    {
        super(obj);

        this.limit = ParameterBlockRegistry.Numeric(obj.for.limit);
        this.blocks = obj.for.blocks.map(k => ProgramBlockRegistry(k));

        // Compute estimated run time
        for(let i = 0; i < this.limit.data; i++)
            for(const block of this.blocks)
                this.estimatedRunTime += block.estimatedRunTime;

        TurbineEventLoop.on(`pbr.stop`, () => this.earlyExit = true);
    }

    /**
     * Execute for loop
     * @throws
     */
    public async execute()
    {        
        const loopCount = this.limit.data;
        TurbineEventLoop.emit("log", "info", `ForBlock: Will loop ${loopCount} times. Starting from: ${this.currentIteration}`);

        for (; this.currentIteration < (loopCount); this.currentIteration++) {
            if (this.earlyExit === true)
            { 
                this.executed = (this.currentIteration + 1 == (loopCount));
                return;
            }

            for (const instuction of this.blocks)
            {
                await instuction.execute();
            }
        }

        this.currentIteration = 0; // reset current iteration if we dont, multiple steps execute for loops only at the begining
        this.executed = true;
    }
    
    static isForPgB(obj: AllProgramBlocks): obj is ForProgramBlockSpec
    {
        return (obj as ForProgramBlockSpec).for !== undefined;
    }
}