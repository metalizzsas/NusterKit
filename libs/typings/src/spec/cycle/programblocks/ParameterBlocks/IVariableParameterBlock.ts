import { IParameterBlock } from "../../IParameterBlock";


export interface IVariableParameterBlock extends IParameterBlock {

    name: "variable";
    value: string;
}
