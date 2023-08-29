import type { Popup } from "../spec/nuster";
import { AccessPoint, NetworkDevice } from "./balena";
import type { ContainerHydrated } from "./containers";
import type { ProgramBlockRunnerHydrated } from "./cycle/ProgramBlockRunnerHydrated";
import type { IOGatesHydrated } from "./io";

import type { MaintenanceHydrated } from "./maintenance";
import type { ProfileHydrated } from "./profiles";

export type WebsocketData = StatusMessage | PopupMessage;

type StatusMessage = {
    type: "status",
    message: Status
}

type PopupMessage = {
    type: "popup",
    message: Popup
}

/** Realtime data */
export interface Status {
    cycle?: ProgramBlockRunnerHydrated;

    /** Containers */
    containers: ContainerHydrated[];

    /** IO hydrated */
    io: IOGatesHydrated[];

    /** Maintenance tasks */
    maintenance: MaintenanceHydrated[];

    /** Network data */
    network: {
        accessPoints: AccessPoint[];
        devices: NetworkDevice[];
    }

}

export { MaintenanceHydrated, ContainerHydrated, IOGatesHydrated, ProgramBlockRunnerHydrated, ProfileHydrated };