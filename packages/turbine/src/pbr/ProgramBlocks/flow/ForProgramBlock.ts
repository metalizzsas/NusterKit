import type { NumericParameterBlockHydrated } from "$types/hydrated/cycle/blocks/ParameterBlockHydrated";
import type { AllProgramBlocks, ForProgramBlock as ForProgramBlockSpec } from "$types/spec/cycle/program";
import { ParameterBlockRegistry } from "../../ParameterBlocks/ParameterBlockRegistry";
import { ProgramBlockRegistry } from "../ProgramBlockRegistry";
import { TurbineEventLoop } from "../../../events";
import { ProgramBlock } from "../ProgramBlock";

export class ForProgramBlock extends ProgramBlock {

    limit: NumericParameterBlockHydrated;
    blocks: Array<ProgramBlock>;

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
    }

    /**
     * Execute for loop
     * @throws
     */
    public async execute(signal?: AbortSignal)
    {        
        const loopCount = this.limit.data;
        TurbineEventLoop.emit("log", "info", `ForBlock: Will loop ${loopCount} times. Starting from: ${this.currentIteration}`);

        for (; this.currentIteration < (loopCount); this.currentIteration++) {

            if (this.earlyExit === true || signal?.aborted === true)
            { 
                this.executed = (this.currentIteration + 1 == (loopCount));
                TurbineEventLoop.emit("log", "info", `ForBlock: Early exit at ${loopCount}.`);
                return;
            }

            for (const instuction of this.blocks)
            {
                await instuction.execute(signal);
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