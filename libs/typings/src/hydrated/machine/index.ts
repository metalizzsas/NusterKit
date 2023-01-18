import type { Configuration } from "../../configuration";
import type { Nuster } from "../../spec/nuster";
import type { HypervisorData, VPNData, DeviceData } from "../balena";

export type MachineData = Configuration & { 
    nuster?: Nuster
    nusterVersion: string, 
    hypervisorData?: HypervisorData, 
    vpnData?: VPNData, 
    deviceData?: DeviceData
}; 