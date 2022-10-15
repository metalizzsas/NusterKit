import { ICallToAction } from "../nuster/ICallToAction";

/** Slot definition used in config */
export interface IConfigSlot {
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

/** 
 * Product series 
 * TODO Make this only available for offline devices
 */
export type EProductSeries = "llc" | "usl" | "tc" | "bc" | "wr" | "cr"; 

/** Slot Sensor interface */
export interface ISlotSensor {
    /** IO gate name of this sensor */
    io: string;
    /** Slot type */
    type: ESlotSensorType;
}

/** Slot sensor type */
export type ESlotSensorType = "level-min-n" | "level-max-n" | "level-a" | "level-np" | "temperature";

/** Slot product options */
export interface ISlotProductOptions {
    /** Lifespan of the product in days if -1, no lifespan, count the life since the product hass been installed */
    lifespan: number;
    /** Default product series */
    defaultProductSeries: EProductSeries;
}