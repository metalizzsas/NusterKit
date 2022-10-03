import { IVariableProgramBlock } from "@metalizzsas/nuster-typings/src/spec/cycle/programblocks/ProgramBlocks/IVariableProgramBlock";
import { CycleController } from "../../controllers/cycle/CycleController";
import { NumericParameterBlocks, StringParameterBlocks } from "../ParameterBlocks";
import { ParameterBlockRegistry } from "../ParameterBlocks/ParameterBlockRegistry";
import { PBRMissingError } from "../PBRMissingError";
import { ProgramBlock } from "./index";

export class VariableProgramBlock extends ProgramBlock implements IVariableProgramBlock
{
    name = "variable" as const;

    params: [StringParameterBlocks, NumericParameterBlocks]

    constructor(obj: IVariableProgramBlock) 
    {
        super(obj);

        this.params = [
            ParameterBlockRegistry(obj.params[0]) as StringParameterBlocks,
            ParameterBlockRegistry(obj.params[1]) as NumericParameterBlocks
        ];
    }

    public async execute(): Promise<void> {

        const pbrInstance = CycleController.getInstance().program;

        if(pbrInstance !== undefined)
        {
            const variableName = this.params[0].data();
            const variableValue = this.params[1].data();
    
            const referenceIndex = pbrInstance.variables.findIndex((v) => v.name == variableName);
    
            if (referenceIndex != -1)
                pbrInstance.variables[referenceIndex].value = variableValue;
            else
                pbrInstance.variables.push({ name: variableName, value: variableValue });
    
            this.executed = true;
        }
        else
            throw new PBRMissingError("VariableBlock");
    }
}


