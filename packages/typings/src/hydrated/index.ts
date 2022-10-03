import { IConfiguration } from "../configuration";
import { IOGates } from "../spec/iogates";
import { IIOPhysicalController } from "../spec/iophysicalcontrollers";
import { IDeviceData } from "./balena/IDeviceData";
import { IHypervisorData } from "./balena/IHypervisorDevice";
import { IVPNData } from "./balena/IVPNData";
import { IProgramBlockRunnerHydrated } from "./cycle/IProgramRunnerHydrated";
import { IMaintenanceHydrated } from "./maintenance";
import { IManualHydrated } from "./manual";
import { IPassiveHydrated } from "./passive";
import { IProfileHydrated } from "./profile";
import { ISlotHydrated } from "./slot";

export interface IWebSocketData
{
    type: "message" | "status" | "popup";
    message: IStatusMessage | IPopupMessage | unknown;
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
   passives: IPassiveHydrated[],
   manuals: IManualHydrated[],
   maintenances: IMaintenanceHydrated[]
}

export interface IPopupMessage
{
    /** Unique identifier to prevent multiple pop ups */
    identifier: string;

    /** i18n text, title of this pop up */
    title: string;
    /** i18n message, body of this popup */
    message: string;

    /** Call to actions */
    callToAction?: {
        /** Name of this CTA */
        name: string;
        /** API Endpoint to be reached by the CTA (NusterTurbine Endpoints) */
        APIEndpoint?: {
            /** URL Reached */
            url: string;
            /** HTTP Request Method */
            method: "get" | "put" | "post" | "delete";
        },
        /** UIEndpoint reached by the CTA (NusterDesktop Endpoints)*/
        UIEndpoint?: string;
    }[]
}