import type { IPBRSCCheckChain } from "@metalizzsas/nuster-typings/build/spec/cycle/programblocks/startchain/IPBRSCCheckChain";
import type { EPBRStartConditionResult } from "@metalizzsas/nuster-typings/build/spec/cycle/programblocks/startchain/IPBRStartCondition";
import type { ParameterBlock } from "../ParameterBlocks";
import { ConditionalParameterBlock } from "../ParameterBlocks/ConditionalParameterBlock";
import { ParameterBlockRegistry } from "../ParameterBlocks/ParameterBlockRegistry";

export class PBRSCCheckChain implements IPBRSCCheckChain
{
    name: "parameter" | "io";

    private checkChain?: ParameterBlock;

    constructor(obj: IPBRSCCheckChain)
    {
        this.name = obj.name;

        if(this.name == "parameter" && obj.parameter !== undefined)
        {
            //Building a config givent parameter block build a conditional test
            this.checkChain = ParameterBlockRegistry(obj.parameter);
        }
        else if(this.name == "io" && obj.io !== undefined)
        {
            //building a default Conditional parameter block for io related start conditions
            this.checkChain = new ConditionalParameterBlock({
                name: "conditional",
                value: "==",
                params: [
                    {
                        name: "io",
                        value: obj.io.gateName,
                    },
                    {
                        name: "const",
                        value: obj.io.gateValue
                    },
                    {
                        name: "conststr",
                        value: "good" 
                    },
                    {
                        name: "conststr",
                        value: "error"
                    }
                ]
            });
        }
    }

    public data(): EPBRStartConditionResult
    {
        if(this.checkChain !== undefined)
        {
            return (this.checkChain.data() as string) as EPBRStartConditionResult;
        }
        else
        {
            return "error";
        }
    }
}
