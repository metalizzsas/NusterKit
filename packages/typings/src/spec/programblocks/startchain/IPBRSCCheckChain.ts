import { IParameterBlocks } from "../../cycle/IParameterBlock";

export interface IPBRSCCheckChain
{
    name: "parameter" | "io";

    parameter?: IParameterBlocks;
    io?: {
        gateName: string;
        gateValue: number;
    }
}