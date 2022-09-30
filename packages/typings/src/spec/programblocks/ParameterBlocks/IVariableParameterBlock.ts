import { IParameterBlock } from "../../cycle/IParameterBlock";


export interface IVariableParameterBlock extends IParameterBlock {

    name: "variable";
    value: string;
}
