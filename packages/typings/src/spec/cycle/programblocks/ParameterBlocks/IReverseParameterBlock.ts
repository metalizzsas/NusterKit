import { INumericParameterBlock, IParameterBlock } from "../../IParameterBlock";


export interface IReverseParameterBlock extends IParameterBlock {
    name: "reverse";
    params: [INumericParameterBlock];
}
