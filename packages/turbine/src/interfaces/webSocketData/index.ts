import { IDeviceData } from "../balena/IDeviceData";
import { IHypervisorData } from "../balena/IHypervisorDevice";
import { IVPNData } from "../balena/IVPNData";
import { IOGates } from "../gates/IIOGate";
import { IConfiguration } from "../IConfiguration";
import { IIOPhysicalController } from "../IIOControllers";
import { ISocketMaintenance } from "../IMaintenance";
import { ISocketManual } from "../IManualMode";
import { ISocketPassive } from "../IPassive";
import { IProfileExportable } from "../IProfile";
import { IProgramRunner } from "../IProgramBlockRunner";
import { ISocketSlot } from "../ISlot";

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