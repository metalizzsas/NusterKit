import { EIOGateNames } from "../../gates/IIOGate";
import { IParameterBlock } from "../../IParameterBlock";

export interface IIOReadParameterBlock extends IParameterBlock {
    name: "io";
    //TODO: This value should indexed from gate names IMachine.iogates.names.map(c => c.name);
    value: EIOGateNames;
}
