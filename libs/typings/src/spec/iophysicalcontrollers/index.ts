import { IEX260Controller } from "./EX260xController";
import { ISerialController } from "./SerialController";
import { IWagoController } from "./WagoController";

export interface IIOPhysicalControllerConfig
{
    /** Type of the IO Handler */
    type: IOControllersTypes;
    /** IP Address on the local network */
    ip: string;

    /** IOScannerInterval */
    ioScannerInterval?: number;
}

/** IOPhysicalController Boilerplate */
export interface IIOPhysicalController extends IIOPhysicalControllerConfig
{
    /** Is the controller connected */
    connected: boolean;

    /** Is the controller unreachable */
    unreachable: boolean;

    /** Function to connect to the controller */
    connect(): Promise<boolean>

    /**
     * Writes data on the controller
     * @param address Address to write data to 
     * @param data Data to write
     * @param word is the data a word or a bit
     */
    writeData(address: number, data: number, word?: boolean): Promise<void>

    /**
     * Reads data from the controller
     * @param address Address to read data from
     * @param word is the data to read a word or a bit
     */
    readData(address: number, word?: boolean): Promise<number>
}

export type IOControllersConfig = (IWagoController | IEX260Controller | ISerialController) & IIOPhysicalControllerConfig;

export type IOControllersTypes = IWagoController["type"] | IEX260Controller["type"] | ISerialController["type"];