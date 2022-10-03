import { INumericParameterBlock, IParameterBlock } from "../../cycle/IParameterBlock";


export interface IMultiplyParameterBlock extends IParameterBlock {
    name: "multiply";
    params: INumericParameterBlock[];
}
