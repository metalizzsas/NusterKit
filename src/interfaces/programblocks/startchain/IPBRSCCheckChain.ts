import { EIOGateNames } from "../../gates/IIOGate";
import { IParameterBlocks } from "../../IParameterBlock";

export interface IPBRSCCheckChain
{
    name: "parameter" | "io";

    parameter?: IParameterBlocks;
    io?: {
        gateName: EIOGateNames;
        gateValue: number;
    }
}