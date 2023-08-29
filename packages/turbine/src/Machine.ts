import type WebSocket from "ws";

import { CycleRouter } from "./routers/CycleRouter";
import { IORouter } from "./routers/IORouter";
import { MaintenanceRouter } from "./routers/MaintenancesRouter";
import { ProfilesRouter } from "./routers/ProfilesRouter";
import { ContainersRouter } from "./routers/ContainersRouters";
import { parseAddon } from "./addons/AddonLoader";
import { LoggerInstance } from "./app";

import type { Configuration, Status, MachineSpecs } from "@metalizzsas/nuster-typings";
import type { HypervisorData, VPNData } from "@metalizzsas/nuster-typings/build/hydrated/balena";
import type { MachineData } from "@metalizzsas/nuster-typings/build/hydrated/machine"; 

import { TurbineEventLoop } from "./events";

import { Machines } from "@metalizzsas/nuster-turbine-machines";
import { NetworkRouter } from "./routers";

export class Machine
{
    data: Configuration;
    specs: MachineSpecs;

    maintenanceRouter: MaintenanceRouter;
    ioRouter: IORouter;
    profileRouter: ProfilesRouter;
    containerRouter: ContainersRouter;
    cycleRouter: CycleRouter;
    networkRouter: NetworkRouter;

    WebSocketServer?: WebSocket.Server = undefined;

    //Balena given data
    private hypervisorData?: HypervisorData;
    private vpnData?: VPNData;

    constructor(obj: Configuration) {
        //Store machine data informations
        this.data = obj;

        // Retreive machine base specs to build all the controllers
        const specs = Machines[`${this.data.model}-${this.data.variant}-${this.data.revision}`];

        if(specs === undefined)
            throw new Error("Machine failed to load specs.json");

        // Assign specs to this instance
        this.specs = specs as MachineSpecs;

        TurbineEventLoop.on("machine.config", (callback) => {
            callback(this.specs);
        });

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

        // Machine Specific addon parsing
        if (this.data.machineAddons.length > 0)
        {
            LoggerInstance.warn(`Machine: Configuration has ${this.data.machineAddons.length} machine specific addon(s).`);
            for (const add of this.data.machineAddons)
                this.specs = parseAddon(this.specs, add, LoggerInstance);
        }

        LoggerInstance.info("Machine: Instantiating controllers");

        this.ioRouter = new IORouter(this.specs.iohandlers, this.specs.iogates);
        this.profileRouter = new ProfilesRouter(this.specs.profileSkeletons, this.specs.profilePremades);
        this.maintenanceRouter = new MaintenanceRouter(this.specs.maintenance);
        this.containerRouter = new ContainersRouter(this.specs.containers);
        this.cycleRouter = new CycleRouter(this.specs.cycleTypes, this.specs.cyclePremades);
        this.networkRouter = new NetworkRouter();

        LoggerInstance.info("Machine: Finished Instantiating controllers");

        // Add event listener for machine variable reads
        for(const variable of this.data.settings.variables)
        {
            TurbineEventLoop.on(`machine.read_variable.${variable.name}`, ({callback}) => {
                callback?.(variable.value);
            });
        }

        //Polling the balenaOS Hypervisor data if device is not in dev mode
        if (process.env.NODE_ENV === 'production')
        {
            setInterval(async () => {
                    fetch(`${process.env.BALENA_SUPERVISOR_ADDRESS}/v2/state/status?apikey=${process.env.BALENA_SUPERVISOR_API_KEY}`, { headers: { "Content-Type": "application/json" } }).then(res => {
                        if (res.status !== 200)
                            return;

                        res.json().then(data => {
                            this.hypervisorData = data;
                        });
                    }).catch(() => {
                        LoggerInstance.warn("Hypervisor: Failed to get Device Hypervisor data.");
                    });

                    fetch(`${process.env.BALENA_SUPERVISOR_ADDRESS}/v2/device/vpn?apikey=${process.env.BALENA_SUPERVISOR_API_KEY}`, { headers: { "Content-Type": "application/json" } }).then(res => {

                        if(res.status !== 200)
                            return;

                        res.json().then(data => {
                            this.vpnData = data;
                        });
                    }).catch(() => {
                        LoggerInstance.warn("Hypervisor: Failed to get Device Hypervisor data.");
                    });
            }, 10000);
        }
    }

    /**
     * Data send to the socket as a Status message in socket connection
     * @returns Data hydrated for socket connection
     */
    public async socketData(): Promise<Status>
    {
        const containers = await this.containerRouter.socketData();

        return {
            cycle: this.cycleRouter.socketData,
            containers: containers,
            io: this.ioRouter.socketData,
            maintenance: this.maintenanceRouter.socketData(),
            network: this.networkRouter.socketData,
        } satisfies Status;
    }

    toJSON(): MachineData {
        return {
            ...this.data,

            nuster: this.specs.nuster,
            
            hypervisorData: this.hypervisorData,
            vpnData: this.vpnData,
        };
    }
}