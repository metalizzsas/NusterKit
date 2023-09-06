import { ProductSeries } from "../containers/products";
import { CyclePremade } from "../cycle";
import { Profile } from "../profiles";

/** Addon */
type Addon = {
    /** Addon name, should be the same as the Json file holding him */
    addonName: string,
    /** Addon content Array  */
    content: Array<ProfilePremadeAddon | 
        CyclePremadeAddon | 
        ContainerProductSeriesAddon | 
        ContainerRegulationMaxTarget | 
        ContainerRegulationSecurityMax | 
        MaintenanceSensorLimitValue | 
        MaintenanceSensorBaseValue>;
}

export { Addon };

type ProfilePremadeAddon = {
    path: "profilePremades";
    mode: "merge";
    content: Array<Profile>;
}

type CyclePremadeAddon = {

    path: "cyclePremades";
    mode: "merge";
    content: Array<CyclePremade>;
}

type ContainerProductSeriesAddon = {
    /**
     * Container product series path
     * @pattern ^containers\.[0-9]+\.supportedProductSeries$
     */
    path: string;
    mode: "merge";
    content: Array<ProductSeries>;
}

type ContainerRegulationMaxTarget = {
    /**
     * Container regulation max target path
     * @pattern ^containers\.[0-9]+\.regulation\.[0-9]+\.maxTarget$
     */
    path: string;
    mode: "set";
    content: number
}

type ContainerRegulationSecurityMax = {
    /**
     * Container regulation security max path
     * @pattern ^containers\.[0-9]+\.regulation\.[0-9]+\.securityMax$
     */
    path: string;
    mode: "set";
    content: number
}

type MaintenanceSensorLimitValue = {
    /**
     * Maintenance sensor limit value path
     * @pattern ^maintenance\.[0-9]+\.sensorLimitValue$
     */
    path: string;
    mode: "set";
    content: number;
}

type MaintenanceSensorBaseValue = {
    /**
     * Maintenance sensor base value path
     * @pattern ^maintenance\.[0-9]+\.sensorBaseValue$
     */
    path: string;
    mode: "set";
    content: number;
}