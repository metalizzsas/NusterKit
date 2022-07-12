import { ProgramBlockRunner } from "../ProgramBlockRunner";
import { ProgramBlock } from "./index";
import { IVariableProgramBlock } from "../../interfaces/programblocks/ProgramBlocks/IVariableProgramBlock";
import { StringParameterBlocks, NumericParameterBlocks } from "../ParameterBlocks";
import { ParameterBlockRegistry } from "../ParameterBlocks/ParameterBlockRegistry";


export class VariableProgramBlock extends ProgramBlock implements IVariableProgramBlock
{
    name: "variable" = "variable";

    params: [StringParameterBlocks, NumericParameterBlocks]

    constructor(pbrInstance: ProgramBlockRunner, obj: IVariableProgramBlock) 
    {
        super(pbrInstance, obj);

        this.params = [
            ParameterBlockRegistry(pbrInstance, obj.params[0]) as StringParameterBlocks,
            ParameterBlockRegistry(pbrInstance, obj.params[1]) as NumericParameterBlocks
        ];
    }

    public async execute(): Promise<void> {
        const vN = this.params[0].data();
        const vV = this.params[1].data();

        const referenceIndex = this.pbrInstance.variables.findIndex((v) => v.name == vN);

        if (referenceIndex != -1) {
            this.pbrInstance.variables[referenceIndex].value = vV;
        }

        else {
            this.pbrInstance.variables.push({ name: vN, value: vV });
        }
    }
}


