import type { Configuration } from "../../configuration";
import type { Nuster } from "../../spec/nuster";
import type { HypervisorData, VPNData } from "../balena";

export type MachineData = Configuration & { 
    nuster?: Nuster
    hypervisorData?: HypervisorData, 
    vpnData?: VPNData,
}; 