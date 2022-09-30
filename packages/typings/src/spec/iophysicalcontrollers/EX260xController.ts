import { IIOPhysicalControllerConfig } from ".";

export interface IEX260Controller extends IIOPhysicalControllerConfig
{
    type: "ex260sx",
    /** Corresponding size of the EX260 (either 16 outputs or 32 outputs) */
    size: 16 | 32,
}