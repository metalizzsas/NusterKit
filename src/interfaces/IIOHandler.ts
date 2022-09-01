export interface IIOHandler
{
    /** Name of the IO Handler */
    name: string;
    /** Type of the IO Handler */
    type: EIOHandlerType;
    /** IP Address on the local network */
    ip: string;
}

export enum EIOHandlerType
{
    EM4 = "em4",
    WAGO = "wago",
    EX260S3 = "ex260s3",
    EX260S1 = "ex260s1"
}