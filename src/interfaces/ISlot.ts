import { ICallToAction } from "./nusterData/ICallToAction";

/** Slot definition used in config */
export interface IConfigSlot
{
    /** Slots name */
    name: string;
    /** Slot type */
    type: string;

    /** Production options, If this is set the slot become productable */
    productOptions?: ISlotProductOptions

    /** Sensors available for this Slots */
    sensors: ISlotSensor[];
    /** Call to action, For UI Purposes only */
    callToAction?: ICallToAction[];
}

/** Product series TODO: Make this only available for offline devices */
export enum EProductSeries {
    LLC = "llc",
    USL = "usl",
    TC = "tc",
    BC = "bc",
    WR = "wr",
    CR = "cr"
}

/** Slot Sensor interface */
export interface ISlotSensor
{
    /** IO gate name of this sensor */
    io: string;
    /** Slot type */
    type: ESlotSensorType;
    /** Slot value */
    value?: number;
}

/** Slot sensor type */
export enum ESlotSensorType {
    LEVEL_NUMERIC_MIN = "level-min-n",
    LEVEL_NUMERIC_MAX = "level-max-n",
    LEVEL_ANALOG = "level-a",
    PRESENCY_NUMERIC = "level-np",
    TEMPERATURE = "temperature",
}

/** Slot product options */
export interface ISlotProductOptions 
{
    /** Lifespan of the product in days if -1, no lifespan, count the life since the product hass been installed */ 
    lifespan: number;
    /** Default product series */
    defaultProductSeries: EProductSeries;
}