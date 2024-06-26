import type { CallToAction } from "../nuster";

/**
 * Product details.
 * @warn  Only support lifespan for now but more might be added in the future
 */
interface ContainerProduct {
    /** 
     * Lifespan of the product in days.
     * If lifespan is not defined, do not apply deprecation to this product
     */
    lifespan?: number
}

/** Slot definition used in config */
interface Container {
    /** Slots name */
    name: string;
    /** Slot type */
    type: string;

    /** Sensors available for this Slots */
    sensors?: ContainerSensor[];

    /** Regulation attached to this container */
    regulations?: ContainerRegulation[];

    /** Supported product series. If defined slot is `Productable` */
    supportedProductSeries?: string[];

    /** Call to action, For UI Purposes only */
    callToAction?: CallToAction[];
}

/** Slot Sensor interface */
interface ContainerSensor {
    /** IO gate name of this sensor */
    io: string;
    /** Attached Logic */
    logic?: "level-min" | "level-max" | "level-limit-max" | "presence";
}

/** Container regulation */
interface ContainerRegulation {

    /** Regulation name */
    name: string;

    /** Base target */
    target: number;

    /** Max target is the maximum setable value for this regulation */
    maxTarget: number;

    /** Security max is the maximum admissible value from the sensor read, will disable regulation if went over */
    securityMax: number;

    /** Regulation Security thats stops it */
    security: ({name: string, value: number} | { name: string, valueDiff: number })[];
    
    /** Sensor used by this regulation */
    sensor: string;
    /** Actuators always active (ex: `pump` for `uscleaner/m/0 - temperature-control`) */
    active: string[];
    /** Actuators used to reach target when we are under target */
    plus: string[];
    /** Actuators used to reach target when we are over target */
    minus: string[];
}

export { Container, ContainerSensor, ContainerRegulation, ContainerProduct };