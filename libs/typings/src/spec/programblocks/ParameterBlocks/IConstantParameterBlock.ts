import { IParameterBlock } from "../../cycle/IParameterBlock";


export interface IConstantParameterBlock extends IParameterBlock {
    name: "const";
    value: number;
}
