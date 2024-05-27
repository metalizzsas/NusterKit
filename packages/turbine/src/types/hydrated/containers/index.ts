import type { Container, ContainerSensor } from "../../spec/containers";
import type { CallToAction } from "../../spec/nuster";
import type { Modify } from "../../utils";

/** Slot data for productable slots */
type ContainerProductData = {
    /** Product series */
    loadedProductType: string;
    /** Porduct load date */
    loadDate: string;
    /** Product lifetime remaining in Milliseconds */
    lifetimeRemaining: number;
}

type ContainerSensorHydrated = ContainerSensor;

type ContainerHydrated = Modify<Container, {
    productData: ContainerProductData;
    isProductable: boolean;

    sensors?: Array<ContainerSensorHydrated>;
    regulations?: Array<ContainerRegulationHydrated>;
    callToAction?: Array<CallToAction>
}>;

type ContainerRegulationHydrated = {
    /** Regulation name */
    name: string;

    /** Regulation current value */
    current: number;
    /** Regulation current value unity */
    currentUnity?: string;

    /**Regulation state */
    state: boolean;

    /** Regulation target */
    target: number;
    /** Regulation max Target */
    maxTarget: number;
};

export { ContainerHydrated, ContainerSensorHydrated, ContainerRegulationHydrated, ContainerProductData };