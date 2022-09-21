export interface IIOPhysicalController
{
    /** Type of the IO Handler */
    type: string;
    /** IP Address on the local network */
    ip: string;
}

export interface IModbusControllers extends IIOPhysicalController
{
    type: "em4" | "wago";
}

export interface IEX260Controller extends IIOPhysicalController
{
    type: "ex260sx",
    /** Corresponding size of the EX260 (either 16 outputs or 32 outputs) */
    size: 16 | 32,
}

export type IOControllers = IModbusControllers | IEX260Controller;

export type IOControllersTypes = IModbusControllers["type"] | IEX260Controller["type"]