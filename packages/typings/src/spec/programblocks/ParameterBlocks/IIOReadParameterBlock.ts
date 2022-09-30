import { IParameterBlock } from "../../cycle/IParameterBlock";

export interface IIOReadParameterBlock extends IParameterBlock {
    name: "io";
    value: string;
}
