import { IParameterBlock } from "../../IParameterBlock";

export interface IIOReadParameterBlock extends IParameterBlock {
    name: "io";
    value: string;
}
