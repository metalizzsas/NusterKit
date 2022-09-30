import { INumericParameterBlock, IParameterBlock } from "../../IParameterBlock";


export interface IMultiplyParameterBlock extends IParameterBlock {
    name: "multiply";
    params: INumericParameterBlock[];
}
