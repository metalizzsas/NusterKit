import type WebSocket from "ws";
import path from "path";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import pkg from "../package.json";

import { CycleController } from "./controllers/cycle/CycleController";
import { IOController } from "./controllers/io/IOController";
import { MaintenanceController } from "./controllers/maintenance/MaintenanceController";
import { ManualModeController } from "./controllers/manual/ManualModeController";
import { ProfileController } from "./controllers/profile/ProfilesController";
import { SlotController } from "./controllers/slot/SlotController";
import { parseAddon } from "./addons/AddonLoader";
import { LoggerInstance } from "./app";

import type { IConfiguration, IMachineSpecs, IStatusMessage } from "@metalizzsas/nuster-typings";
import type { IHypervisorData } from "@metalizzsas/nuster-typings/build/hydrated/balena/IHypervisorDevice";
import type { IDeviceData } from "@metalizzsas/nuster-typings/build/hydrated/balena/IDeviceData";
import type { IVPNData } from "@metalizzsas/nuster-typings/build/hydrated/balena/IVPNData";

import type { ConfigModel, ConfigVariant } from "@metalizzsas/nuster-typings/build/configuration";

import * as MetalfogMR1 from "@metalizzsas/nuster-turbine-machines/data/metalfog/m/1/specs.json";

import * as SmoothitMR1 from "@metalizzsas/nuster-turbine-machines/data/smoothit/m/1/specs.json";
import * as SmoothitMR2 from "@metalizzsas/nuster-turbine-machines/data/smoothit/m/2/specs.json";

import * as USCleanerMR1 from "@metalizzsas/nuster-turbine-machines/data/uscleaner/m/1/specs.json";

type models = `${ConfigModel}/${ConfigVariant}/${number}`;

export const AvailableMachineModels: {[x: models]: unknown} = {
    "metalfog/m/1": MetalfogMR1,
    "smoothit/m/1": SmoothitMR1,
    "smoothit/m/2": SmoothitMR2,
    "uscleaner/m/1": USCleanerMR1
};

export class Machine
{
    data: IConfiguration;
    specs: IMachineSpecs;

    private maintenanceController: MaintenanceController;
    private ioController: IOController;
    private profileController: ProfileController;
    private slotController: SlotController;
    private manualmodeController: ManualModeController;
    private cycleController: CycleController;

    WebSocketServer?: WebSocket.Server = undefined;

    //Balena given data
    private hypervisorData?: IHypervisorData;
    private vpnData?: IVPNData;
    private deviceData?: IDeviceData;

    constructor(obj: IConfiguration) {
        //Store machine data informations
        this.data = obj;

        // Retreive machine base specs to build all the controllers
        const specs = AvailableMachineModels[`${this.data.model}/${this.data.variant}/${this.data.revision}`];

        if(specs === undefined)
            throw new Error("Machine failed to load specs.json");

        // Assign specs to this instance
        this.specs = specs as IMachineSpecs;

        // Addon Parsing
        if (this.data.addons !== undefined) {
            LoggerInstance.warn("Machine: " + this.data.addons.length + " Addon(s) detected. SHOULD NOT BE USED IN PRODUCTION!");
            for (const add of this.data.addons)
            {
                const addon = this.specs.addons?.find(a => a.addonName == add);

                if(addon)
                    this.specs = parseAddon(this.specs, addon, LoggerInstance);
                else
                    LoggerInstance.error(`Addon: ${addon} does not exists.`);
            }
        }

        // Machine Specific addon parsing
        if (this.data.machineAddons !== undefined) {
            LoggerInstance.info(`Machine: Configuration has ${this.data.machineAddons.length} machine specific addon(s). SHOULD BE USED AS LESS AS POSSIBLE!`);
            for (const add of this.data.machineAddons)
                this.specs = parseAddon(this.specs, add, LoggerInstance);
        }

        //if config file has settings let them is the settings var
        if (this.data.settings !== undefined)
            LoggerInstance.info("Machine: Custom settings detected.");

        LoggerInstance.info("Machine: Instantiating controllers");

        this.ioController = IOController.getInstance(this.specs.iohandlers, this.specs.iogates);
        this.profileController = ProfileController.getInstance(this.specs.profileSkeletons, this.specs.profilePremades, this.data.settings?.maskedProfiles);
        this.maintenanceController = MaintenanceController.getInstance(this.specs.maintenance);
        this.slotController = SlotController.getInstance(this.specs.slots);
        this.manualmodeController = ManualModeController.getInstance(this.specs.manual, this.data.settings?.maskedManuals);
        this.cycleController = CycleController.getInstance(this.specs.cycleTypes, this.specs.cyclePremades, this.data.settings?.maskedPremades);

        LoggerInstance.info("Machine: Finished Instantiating controllers");

        if (process.env.NODE_ENV === 'production') {
            //Polling the balenaOS Data if device is not in dev mode
            setInterval(async () => {
                try {
                    const hyperv = await fetch("http://127.0.0.1:48484/v2/state/status?apikey=" + process.env.BALENA_SUPERVISOR_API_KEY, { headers: { "Content-Type": "application/json" } });
                    const vpn = await fetch("http://127.0.0.1:48484/v2/device/vpn?apikey=" + process.env.BALENA_SUPERVISOR_API_KEY, { headers: { "Content-Type": "application/json" } });
                    const device = await fetch("http://127.0.0.1:48484/v1/device?apikey=" + process.env.BALENA_SUPERVISOR_API_KEY, { headers: { "Content-Type": "application/json" } });

                    if (hyperv.status == 200)
                        this.hypervisorData = await hyperv.json();

                    if (vpn.status == 200)
                        this.vpnData = await vpn.json();

                    if (device.status == 200)
                        this.deviceData = await device.json();
                }
                catch (ex) {
                    LoggerInstance.warn("Hypervisor: Failed to get Hypervisor data.");
                }
            }, 10000);
        }
    }

    /**
     * Data send to the socket as a Status message in socket connection
     * @returns Data hydrated for socket connection
     */
    public async socketData(): Promise<IStatusMessage> {
        const profiles = await this.profileController.socketData();
        const maintenances = await this.maintenanceController.socketData();
        const slot = await this.slotController.socketData();

        return {
            "machine": this.toJSON(),
            "cycle": this.cycleController.socketData,
            "slots": slot,
            "profiles": profiles,
            "io": this.ioController.socketData[0],
            "handlers": this.ioController.socketData[1],
            "manuals": this.manualmodeController.socketData,
            "maintenances": maintenances
        }
    }

    get assetsFolder() {
        return path.resolve(this.baseNTMFolder, 'assets');
    }

    get baseNTMFolder() {
        return path.resolve("node_modules", "@metalizzsas", "nuster-turbine-machines", "data", this.data.model, this.data.variant, `${this.data.revision}`);
    }

    toJSON(): IStatusMessage["machine"] {
        return {
            ...this.data,

            hypervisorData: this.hypervisorData,
            vpnData: this.vpnData,
            deviceData: this.deviceData,
            nusterVersion: pkg.version,
        };
    }
}