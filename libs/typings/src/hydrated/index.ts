import { IConfiguration } from "../configuration";
import { IOGates } from "../spec/iogates";
import { IIOPhysicalController } from "../spec/iophysicalcontrollers";
import { ICallToAction } from "../spec/nuster/ICallToAction";
import { IDeviceData } from "./balena/IDeviceData";
import { IHypervisorData } from "./balena/IHypervisorDevice";
import { IVPNData } from "./balena/IVPNData";
import { IProgramBlockRunnerHydrated } from "./cycle/IProgramRunnerHydrated";
import { IMaintenanceHydrated } from "./maintenance";
import { IManualHydrated } from "./manual";
import { IProfileHydrated } from "./profile";
import { ISlotHydrated } from "./slot";

export interface IWebSocketData
{
    type: "message" | "status" | "popup";
    message: IStatusMessage | IPopup | unknown;
}

export interface IStatusMessage
{
   machine: IConfiguration & {
        hypervisorData?: IHypervisorData,
        vpnData?: IVPNData,
        deviceData?: IDeviceData,

        nusterVersion: string
   },
   cycle?: IProgramBlockRunnerHydrated,
   slots: ISlotHydrated[],
   profiles: IProfileHydrated[],
   io: IOGates[],
   handlers: IIOPhysicalController[],
   manuals: IManualHydrated[],
   maintenances: IMaintenanceHydrated[]
}

export interface IPopup
{
    /** i18n text, title of this pop up */
    title: string;
    /** i18n message, body of this popup */
    message: string;

    /** Call to actions */
    callToAction?: ICallToAction[]
}