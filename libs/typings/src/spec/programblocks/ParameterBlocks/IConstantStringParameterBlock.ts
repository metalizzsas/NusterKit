import { IParameterBlock } from "../../cycle/IParameterBlock";

export interface IConstantStringParameterBlock extends IParameterBlock {
    name: "conststr";
    value: string;
}