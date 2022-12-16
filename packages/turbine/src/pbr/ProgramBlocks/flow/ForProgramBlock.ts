import type { NumericParameterBlockHydrated } from "@metalizzsas/nuster-typings/build/hydrated/cycle/blocks/ParameterBlockHydrated";
import type { AllProgramBlocks, ForProgramBlock as ForProgramBlockSpec } from "@metalizzsas/nuster-typings/build/spec/cycle/IProgramBlocks";
import { ProgramBlockHydrated } from "@metalizzsas/nuster-typings/build/hydrated/cycle/blocks/ProgramBlockHydrated";
import { LoggerInstance } from "../../../app";
import { ParameterBlockRegistry } from "../../ParameterBlocks/ParameterBlockRegistry";
import { PBRMissingError } from "../../PBRMissingError";
import type { ProgramBlockRunner } from "../../ProgramBlockRunner";
import { ProgramBlockRegistry } from "../ProgramBlockRegistry";

export class ForProgramBlock extends ProgramBlockHydrated {

    limit: NumericParameterBlockHydrated;
    blocks: Array<ProgramBlockHydrated>;

    currentIteration = 0;
    executed = false;

    constructor(obj: ForProgramBlockSpec, pbrInstance?: ProgramBlockRunner)
    {
        super(obj, pbrInstance);

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
    public async execute()
    {
        if(this.pbrInstance === undefined)
            throw new PBRMissingError("ForLoop");
        
        const loopCount = this.limit.data;
        LoggerInstance.info(`ForBlock: Will loop ${loopCount} times. Starting from: ${this.currentIteration}`);

        for (; this.currentIteration < (loopCount); this.currentIteration++) {
            if (["ending", "ended"].includes(this.pbrInstance.currentRunningStep?.state) || ["ended", "ending"].includes(this.pbrInstance.status.mode))
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