import type { Configuration } from "../../configuration";
import type { Nuster } from "../../spec/nuster";
import type { HypervisorData, VPNData } from "../balena";

export type MachineData = Configuration & { 
    
    /** Current turbine version */
    turbineVersion: string;

    /** Nuster additional data */
    nuster?: Nuster;

    /** Data from balena hypervisor */
    hypervisorData?: HypervisorData;

    /** Data from balena VPN */    
    vpnData?: VPNData;
}; 