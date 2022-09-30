import { IParameterBlock } from "../../IParameterBlock";

export interface IConstantStringParameterBlock extends IParameterBlock {
    name: "conststr";
    value: string;
}