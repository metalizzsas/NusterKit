import { INumericParameterBlock, IParameterBlock } from "../../IParameterBlock";


export interface IAdditionParameterBlock extends IParameterBlock {
    name: "add";
    params: INumericParameterBlock[];
}
