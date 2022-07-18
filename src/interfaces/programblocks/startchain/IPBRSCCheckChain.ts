import { IParameterBlocks } from "../../IParameterBlock";

export interface IPBRSCCheckChain
{
    name: "parameter" | "io";

    parameter?: IParameterBlocks;
    io?: {
        gateName: string;
        gateValue: number;
    }
}