export interface IIOHandler
{
    name: string;
    type: EIOHandlerType;
    ip: string;
}

export enum EIOHandlerType
{
    EM4 = "em4",
    WAGO = "wago",
    EX260S3 = "ex260s3",
    EX260S1 = "ex260s1"
}