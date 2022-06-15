export interface IConfigSlot
{
    name: string;
    type: string;

    // if product ooption is defined then this slot is productable
    productOptions?: ISlotProductOptions

    sensors: ISlotSensor[];
    callToAction?: ICallToAction[];
}

export enum EProductSeries {
    LLC = "llc",
    USL = "usl",
    TC = "tc",
    BC = "bc",
    WR = "wr",
    CR = "cr"
}

export interface ISlotSensor
{
    io: string;
    type: ESlotSensorType;
    value?: number;
}

export enum ESlotSensorType {
    LEVEL_NUMERIC_MIN = "level-min-n",
    LEVEL_NUMERIC_MAX = "level-max-n",
    LEVEL_ANALOG = "level-a",
    PRESENCY_NUMERIC = "level-np",
    TEMPERATURE = "temperature",
}

export interface ICallToAction
{
    name: string;
    APIEndpoint?: {
        url: string;
        method: "get" | "put" | "post" | "delete";
    },
    UIEndpoint?: string;
}

export interface ISlotProductOptions 
{ 
    lifespan: number; //Lifespan of product in days.
    defaultProductSeries: EProductSeries; //Default product series.
}