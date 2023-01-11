import type { Configuration } from "../../configuration";
import type { HypervisorData, VPNData, DeviceData } from "../balena";

export type MachineData = Configuration & { nusterVersion: string, hypervisorData?: HypervisorData, vpnData?: VPNData, deviceData?: DeviceData }; 