import type { ContainerRegulation } from "../containers/index";
import type { CyclePremade } from "../cycle/index";
import type { IOGates } from "../iogates/index";
import type { HomeInfo } from "../nuster/index";
import type { Profile } from "../profiles/index";

/** Addon */
type Addon = {
    /** Addon name, should be the same as the Json file holding him */
    addonName: string,
    /** Addon content Array  */
    content: Array<NusterHomeInformationsAddon |
        IOGatesAddon |
        ProfilePremadeAddon | 
        CyclePremadeAddon | 
        ContainerProductSeriesAddon | 
        ContainerRegulationAddon | 
        ContainerRegulationsMaxTarget | 
        ContainerRegulationsSecurityMax | 
        MaintenanceSensorLimitValue | 
        MaintenanceSensorBaseValue>;
}

export { Addon };

type NusterHomeInformationsAddon = {

    path: "nuster.homeInformations";
    mode: "merge";
    content: Array<HomeInfo>;
}

type IOGatesAddon = {

    path: "iogates";
    mode: "merge";
    content: Array<IOGates>;
}

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
    content: Array<string>;
}

type ContainerRegulationsMaxTarget = {
    /**
     * Container regulation max target path
     * @pattern ^containers\.[0-9]+\.regulations\.[0-9]+\.maxTarget$
     */
    path: string;
    mode: "set";
    content: number
}

type ContainerRegulationsSecurityMax = {
    /**
     * Container regulation security max path
     * @pattern ^containers\.[0-9]+\.regulations\.[0-9]+\.securityMax$
     */
    path: string;
    mode: "set";
    content: number
}

type ContainerRegulationAddon = {
    /**
     * Container regulation path
     * @pattern ^containers\.[0-9]+\.regulations$
     */
    path: string;

    mode: "set";

    content: [ContainerRegulation];
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