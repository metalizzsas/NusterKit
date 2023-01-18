import type WebSocket from "ws";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import pkg from "../package.json";

import { CycleRouter } from "./routers/CycleRouter";
import { IORouter } from "./routers/IORouter";
import { MaintenanceRouter } from "./routers/MaintenancesRouter";
import { ProfilesRouter } from "./routers/ProfilesRouter";
import { ContainersRouter } from "./routers/ContainersRouters";
import { parseAddon } from "./addons/AddonLoader";
import { LoggerInstance } from "./app";

import type { Configuration, Status, MachineSpecs } from "@metalizzsas/nuster-typings";
import type { HypervisorData, DeviceData, VPNData } from "@metalizzsas/nuster-typings/build/hydrated/balena";
import type { MachineData } from "@metalizzsas/nuster-typings/build/hydrated/machine"; 

import { TurbineEventLoop } from "./events";

import { Machines } from "@metalizzsas/nuster-turbine-machines";

export class Machine
{
    data: Configuration;
    specs: MachineSpecs;

    maintenanceRouter: MaintenanceRouter;
    ioRouter: IORouter;
    profileRouter: ProfilesRouter;
    containerRouter: ContainersRouter;
    cycleRouter: CycleRouter;

    WebSocketServer?: WebSocket.Server = undefined;

    //Balena given data
    private hypervisorData?: HypervisorData;
    private vpnData?: VPNData;
    private deviceData?: DeviceData;

    constructor(obj: Configuration) {
        //Store machine data informations
        this.data = obj;

        // Retreive machine base specs to build all the controllers
        const specs = Machines[`${this.data.model}-${this.data.variant}-${this.data.revision}`];

        if(specs === undefined)
            throw new Error("Machine failed to load specs.json");

        // Assign specs to this instance
        this.specs = specs as MachineSpecs;

        // Addon Parsing
        if (this.data.addons !== undefined && this.data.addons.length > 0) {
            LoggerInstance.warn("Machine: " + this.data.addons.length + " Addon(s) detected.");
            for (const add of this.data.addons)
            {
                const addon = this.specs.addons?.find(a => a.addonName == add);

                if(addon)
                    this.specs = parseAddon(this.specs, addon, LoggerInstance);
                else
                    LoggerInstance.error(`Addon: ${add} does not exists.`);
            }
        }

        // Machine Specific addon parsing @beta
        if (this.data.machineAddons.length > 0)
        {
            LoggerInstance.warn(`Machine: Configuration has ${this.data.machineAddons.length} machine specific addon(s). SHOULD BE USED AS LESS AS POSSIBLE!`);
            for (const add of this.data.machineAddons)
                this.specs = parseAddon(this.specs, add, LoggerInstance);
        }

        //if config file has settings let them is the settings var
        if (this.data.settings !== undefined)
            LoggerInstance.info("Machine: Custom settings detected.");

        LoggerInstance.info("Machine: Instantiating controllers");

        this.ioRouter = new IORouter(this.specs.iohandlers, this.specs.iogates);
        this.profileRouter = new ProfilesRouter(this.specs.profileSkeletons, this.specs.profilePremades);
        this.maintenanceRouter = new MaintenanceRouter(this.specs.maintenance);
        this.containerRouter = new ContainersRouter(this.specs.containers);
        this.cycleRouter = new CycleRouter(this.specs.cycleTypes, this.specs.cyclePremades);

        LoggerInstance.info("Machine: Finished Instantiating controllers");

        // Add event listener for machine variable reads
        for(const variable of this.data.settings.variables)
        {
            TurbineEventLoop.on(`machine.read_variable.${variable.name}`, ({callback}) => {
                callback?.(variable.value);
            });
        }

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
    public async socketData(): Promise<Status> {
        const containers = await this.containerRouter.socketData();

        return {
            "cycle": this.cycleRouter.socketData,
            "containers": containers,
            "io": this.ioRouter.socketData,
        } satisfies Status;
    }

    toJSON(): MachineData {
        return {
            ...this.data,
            
            nusterVersion: pkg.version,
            hypervisorData: this.hypervisorData,
            vpnData: this.vpnData,
            deviceData: this.deviceData
        };
    }
}