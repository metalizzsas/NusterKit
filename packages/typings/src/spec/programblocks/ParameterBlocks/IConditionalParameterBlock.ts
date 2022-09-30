import { INumericParameterBlock, IParameterBlock, IStringParameterBlock } from "../../cycle/IParameterBlock";


export interface IConditionalParameterBlock extends IParameterBlock {
    name: "conditional";
    value: ">" | "<" | "==" | "!=";
    params: [
        INumericParameterBlock,
        INumericParameterBlock,
        INumericParameterBlock | IStringParameterBlock,
        INumericParameterBlock | IStringParameterBlock
    ];
}
