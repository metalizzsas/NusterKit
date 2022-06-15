import { EParameterBlockName } from "../../interfaces/IParameterBlock";
import { IPBRSCCheckChain } from "../../interfaces/programblocks/startchain/IPBRSCCheckChain";
import { EPBRStartConditionResult } from "../../interfaces/programblocks/startchain/IPBRStartCondition";
import { ConditionalParameterBlock, ParameterBlock, ParameterBlockRegistry } from "../ParameterBlocks";
import { ProgramBlockRunner } from "../ProgramBlockRunner";

export class PBRSCCheckChain implements IPBRSCCheckChain
{
    name: "parameter" | "io";

    #checkChain?: ParameterBlock;

    constructor(obj: IPBRSCCheckChain, pbrinstance: ProgramBlockRunner)
    {
        this.name = obj.name;

        if(this.name == "parameter" && obj.parameter !== undefined)
        {
            //Building a config givent parameter block build a conditional test
            this.#checkChain = ParameterBlockRegistry(pbrinstance, obj.parameter);
        }
        else if(this.name == "io" && obj.io !== undefined)
        {
            //building a default Conditional parameter block for io related start conditions
            this.#checkChain = new ConditionalParameterBlock(pbrinstance, {
                name: EParameterBlockName.CONDITIONAL,
                value: "==",
                params: [
                    {
                        name: EParameterBlockName.IO,
                        value: obj.io.gateName,
                    },
                    {
                        name: EParameterBlockName.CONSTANT,
                        value: obj.io.gateValue
                    },
                    {
                        name: EParameterBlockName.CONSTANT_STRING,
                        value: "good" 
                    },
                    {
                        name: EParameterBlockName.CONSTANT_STRING,
                        value: "error"
                    }
                ]
            });
        }
    }

    public data(): EPBRStartConditionResult
    {
        if(this.#checkChain !== undefined)
        {
            return (this.#checkChain.data() as string) as EPBRStartConditionResult;
        }
        else
        {
            return EPBRStartConditionResult.ERROR;
        }
    }
}
