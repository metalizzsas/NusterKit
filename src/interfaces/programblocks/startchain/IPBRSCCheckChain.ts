import { IParameterBlock } from "../../IParameterBlock";

export interface IPBRSCCheckChain
{
    name: "parameter" | "io";

    parameter?: IParameterBlock;
    io?: {
        gateName: string;
        gateValue: string;
    }
}