import { IParameterBlock } from "../../IParameterBlock";


export interface IConstantParameterBlock extends IParameterBlock {
    name: "const";
    value: number;
}
