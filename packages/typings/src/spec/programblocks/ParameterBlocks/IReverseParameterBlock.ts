import { INumericParameterBlock, IParameterBlock } from "../../cycle/IParameterBlock";


export interface IReverseParameterBlock extends IParameterBlock {
    name: "reverse";
    params: [INumericParameterBlock];
}
