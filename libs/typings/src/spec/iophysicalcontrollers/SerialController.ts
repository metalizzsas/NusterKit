import { IIOPhysicalControllerConfig } from ".";

export interface ISerialController extends IIOPhysicalControllerConfig
{
    type: "serial",
    /** Port of serial device ex: `/dev/tty1` */
    port: string;
    /** BaudRate used to communicate */
    baudRate: number;
}