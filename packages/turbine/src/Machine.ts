import type WebSocket from "ws";

import * as pack from '../package.json';

import { CycleRouter } from "./routers/CycleRouter";
import { IORouter } from "./routers/IORouter";
import { MaintenanceRouter } from "./routers/MaintenancesRouter";
import { ProfilesRouter } from "./routers/ProfilesRouter";
import { ContainersRouter } from "./routers/ContainersRouters";
import { parseAddon } from "./addons/AddonLoader";

import type { Configuration, Status, MachineSpecs } from "./types";
import type { HypervisorData, VPNData } from "./types/hydrated/balena";
import type { MachineData } from "./types/hydrated/machine"; 

import { TurbineEventLoop } from "./events";

import { NetworkRouter } from "./routers";
import { CalltoActionRouter } from "./routers/CallToAction";

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
    callToActionRouter: CalltoActionRouter;

    WebSocketServer?: WebSocket.Server = undefined;

    //Balena given data
    private hypervisorData?: HypervisorData;
    private vpnData?: VPNData;

    constructor(data: Configuration, specs: MachineSpecs)
    {
        this.data = data;
        this.specs = specs;

        TurbineEventLoop.on("machine.config", (callback) => {
            callback(this.specs);
        });

        // Addon Parsing
        if (this.data.addons !== undefined && this.data.addons.length > 0) {
             TurbineEventLoop.emit('log', 'warning', "Machine: " + this.data.addons.length + " Addon(s) detected.");
            for (const add of this.data.addons)
            {
                const addon = this.specs.addons?.find(a => a.addonName == add);

                if(addon)
                    this.specs = parseAddon(this.specs, addon);
                else
                     TurbineEventLoop.emit('log', 'error', `Addon: ${add} does not exists.`);
            }
        }

        // Machine Specific addon parsing
        if (this.data.machineAddons.length > 0)
        {
             TurbineEventLoop.emit('log', 'warning', `Machine: Configuration has ${this.data.machineAddons.length} machine specific addon(s).`);
            for (const add of this.data.machineAddons)
                this.specs = parseAddon(this.specs, add);
        }

         TurbineEventLoop.emit('log', 'info', "Machine: Instantiating controllers");

        this.callToActionRouter = new CalltoActionRouter();
        this.ioRouter = new IORouter(this.specs.iohandlers, this.specs.iogates);
        this.profileRouter = new ProfilesRouter(this.specs.profileSkeletons, this.specs.profilePremades);
        this.maintenanceRouter = new MaintenanceRouter(this.specs.maintenance);
        this.containerRouter = new ContainersRouter(this.specs.containers, this.specs.containerProducts);
        this.cycleRouter = new CycleRouter(this.specs.cycleTypes, this.specs.cyclePremades);
        this.networkRouter = new NetworkRouter();

         TurbineEventLoop.emit('log', 'info', "Machine: Finished Instantiating controllers");

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
                         TurbineEventLoop.emit('log', 'warning', "Hypervisor: Failed to get Device Hypervisor data.");
                    });

                    fetch(`${process.env.BALENA_SUPERVISOR_ADDRESS}/v2/device/vpn?apikey=${process.env.BALENA_SUPERVISOR_API_KEY}`, { headers: { "Content-Type": "application/json" } }).then(res => {

                        if(res.status !== 200)
                            return;

                        res.json().then(data => {
                            this.vpnData = data;
                        });
                    }).catch(() => {
                         TurbineEventLoop.emit('log', 'warning', "Hypervisor: Failed to get Device Hypervisor data.");
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

            turbineVersion: pack.version,

            nuster: this.specs.nuster,
            
            hypervisorData: this.hypervisorData,
            vpnData: this.vpnData,
        };
    }
}