import { IConfiguration } from "../configuration";
import { IProgramRunner } from "../spec/cycle/IProgramBlockRunner";
import { IOGates } from "../spec/iogates";
import { IIOPhysicalController } from "../spec/iophysicalcontrollers";
import { IDeviceData } from "./balena/IDeviceData";
import { IHypervisorData } from "./balena/IHypervisorDevice";
import { IVPNData } from "./balena/IVPNData";
import { ISocketMaintenance } from "./maintenance";
import { ISocketManual } from "./manual";
import { ISocketPassive } from "./passive";
import { IProfileExportable } from "./profile";
import { ISocketSlot } from "./slot";

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
   cycle?: IProgramRunner,
   slots: ISocketSlot[],
   profiles: IProfileExportable[],
   io: IOGates[],
   handlers: IIOPhysicalController[],
   passives: ISocketPassive[],
   manuals: ISocketManual[],
   maintenances: ISocketMaintenance[]
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