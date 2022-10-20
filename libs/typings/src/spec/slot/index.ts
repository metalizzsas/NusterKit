import { ICallToAction } from "../nuster/ICallToAction";
import { EProductSeries } from "./products";
import { IRegulation } from "./regulation";

/** Slot definition used in config */
export interface IConfigSlot {
    /** Slots name */
    name: string;
    /** Slot type */
    type: string;

    /** Sensors available for this Slots */
    sensors?: ISlotSensor[];

    /** Supported product series. If defined slot is `Productable` */
    supportedProductSeries?: EProductSeries[];

    /** Call to action, For UI Purposes only */
    callToAction?: ICallToAction[];
}

/** Slot Sensor interface */
export interface ISlotSensor {
    /** IO gate name of this sensor */
    io: string;
    /** Slot type */
    type: ESlotSensorType;

    /** Passive Regulation, if defined, this slot as a regulation */
    regulation?: IRegulation
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