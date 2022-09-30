export interface IIOPhysicalControllerConfig
{
    /** Type of the IO Handler */
    type: IOControllersTypes;
    /** IP Address on the local network */
    ip: string;
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

export interface IWagoController extends IIOPhysicalControllerConfig
{
    type: "wago";
}

export interface IEX260Controller extends IIOPhysicalControllerConfig
{
    type: "ex260sx",
    /** Corresponding size of the EX260 (either 16 outputs or 32 outputs) */
    size: 16 | 32,
}

export type IOControllersConfig = (IWagoController | IEX260Controller) & IIOPhysicalControllerConfig;

export type IOControllersTypes = IWagoController["type"] | IEX260Controller["type"];