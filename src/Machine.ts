import fs from "fs";
import path from "path";
import WebSocket from "ws";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import pkg from "../package.json";

import { CycleController } from "./controllers/cycle/CycleController";
import { PassiveController } from "./controllers/passives/PassiveController";
import { IOController } from "./controllers/io/IOController";
import { MaintenanceController } from "./controllers/maintenance/MaintenanceController";
import { ManualModeController } from "./controllers/manual/ManualModeController";
import { ProfileController } from "./controllers/profile/ProfilesController";
import { SlotController } from "./controllers/slot/SlotController";
import { parseAddon } from "./addons/AddonLoader";

import type { IMachine } from "./interfaces/IMachine";
import type { IAddon } from "./interfaces/IAddon";
import type { IHypervisorData } from "./interfaces/balena/IHypervisorDevice";
import type { IVPNData } from "./interfaces/balena/IVPNData";
import type { IDeviceData } from "./interfaces/balena/IDeviceData";
import { INusterPopup } from "./interfaces/nusterData/INusterPopup";
import { IConfiguration } from "./interfaces/IConfiguration";
import { LoggerInstance } from "./app";

export class Machine
{
    data: IConfiguration;

    specs: IMachine;

    private maintenanceController: MaintenanceController;
    private ioController: IOController;
    private profileController: ProfileController;
    private slotController: SlotController;
    private manualmodeController: ManualModeController;
    private cycleController: CycleController;
    private passiveController: PassiveController;
    
    WebSocketServer?: WebSocket.Server = undefined;

    //Balena given data
    private hypervisorData?: IHypervisorData;
    private vpnData?: IVPNData;
    private deviceData?: IDeviceData;

    constructor(obj: IConfiguration)
    {
        //Store machine data informations
        this.data = obj;

        // Retreive machine base specs to build all the controllers around this file
        const raw = fs.readFileSync(path.resolve(this.baseNTMFolder, "specs.json"), {encoding: "utf-8"});
        const specsParsed = JSON.parse(raw) as IMachine;

        // Assign specs to this instance
        this.specs = (specsParsed as IMachine);

        // Addon Parsing
        if(this.data.addons !== undefined)
        {
            LoggerInstance.warn("Machine: " + this.data.addons.length + " Addon(s) detected. SHOULD NOT BE USED IN PRODUCTION!");
            for(const add of this.data.addons)
            {
                const addonPath = path.resolve(this.baseNTMFolder, "addons", add + ".json");

                if(fs.existsSync(addonPath))
                {
                    const rawAddon = fs.readFileSync(addonPath, {encoding: 'utf-8'});
                    const addonParsed = JSON.parse(rawAddon) as IAddon;
    
                    this.specs = parseAddon(this.specs, addonParsed, LoggerInstance);
                }
                else
                    LoggerInstance.error(`Addon: ${addonPath} does not exists.`);
            }
        }

        // Machine Specific addon parsing
        if(this.data.machineAddons !== undefined)
        {
            LoggerInstance.info(`Machine: Configuration has ${this.data.machineAddons.length} machine specific addon(s). SHOULD BE USED AS LESS AS POSSIBLE!`);
            for(const add of this.data.machineAddons)
                this.specs = parseAddon(this.specs, add, LoggerInstance);
        }

        //if config file has settings let them is the settings var
        if(this.data.settings !== undefined)
            LoggerInstance.info("Machine: Custom settings detected.");

        LoggerInstance.info("Machine: Instantiating controllers");

        this.maintenanceController = MaintenanceController.getInstance(this.specs.maintenance);
        this.ioController = IOController.getInstance(this.specs.iohandlers, this.specs.iogates);
        this.profileController = ProfileController.getInstance(this.specs.profileSkeletons, this.specs.profilePremades, this.data.settings?.maskedProfiles);
        this.slotController = SlotController.getInstance(this.specs.slots);
        this.manualmodeController = new ManualModeController(this);
        this.cycleController = CycleController.getInstance(this.specs.cycleTypes, this.specs.cyclePremades, this.data.settings?.maskedPremades);
        this.passiveController = new PassiveController(this);

        LoggerInstance.info("Machine: Finished Instantiating controllers");

        if(process.env.NODE_ENV === 'production')
        {
            //Polling the balenaOS Data if device is not in dev mode
            setInterval(async () => {
                try
                {
                    const hyperv = await fetch("http://127.0.0.1:48484/v2/state/status?apikey=" + process.env.BALENA_SUPERVISOR_API_KEY, { headers: { "Content-Type": "application/json" }});
                    const vpn = await fetch("http://127.0.0.1:48484/v2/device/vpn?apikey=" + process.env.BALENA_SUPERVISOR_API_KEY, { headers: { "Content-Type": "application/json" }});
                    const device = await fetch("http://127.0.0.1:48484/v1/device?apikey=" + process.env.BALENA_SUPERVISOR_API_KEY, { headers: { "Content-Type": "application/json" }});
        
                    if(hyperv.status == 200)
                        this.hypervisorData = await hyperv.json();
                    
                    if(vpn.status == 200)
                        this.vpnData = await vpn.json();

                    if(device.status == 200)
                        this.deviceData = await device.json();
                }
                catch(ex)
                {
                    LoggerInstance.warn("Hypervisor: Failed to get Hypervisor data.");
                }
            }, 10000);
        }
    }

    /**
     * Display a popup to all connected Websocket clients
     * @param popupData Popup data to be sent to clients
     */
    public displayPopup(popupData: INusterPopup)
    {
        if(this.WebSocketServer !== undefined)
        {
            LoggerInstance.info(`Websocket: Displaying popup ${popupData.message}.`);

            for(const client of this.WebSocketServer.clients)
            {
                client.send(JSON.stringify({
                    type: "popup",
                    message: popupData
                }));
            }
        }
        else
        {
            LoggerInstance.warn("Websocket: Unable to send popup, Websocket server is not defined.");
        }
    }

    public async socketData()
    {
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
            "passives": this.passiveController.socketData,
            "manuals": this.manualmodeController.socketData,
            "maintenances": maintenances
        }
    }

    get assetsFolder()
    {
        return path.resolve(this.baseNTMFolder, "assets");
    }

    get baseNTMFolder()
    {
        return path.resolve("nuster-turbine-machines", "data", this.data.model, this.data.variant, `${this.data.revision}`);
    }

    toJSON()
    {
        return {
            ...this.data,

            /** 
             * BalenaOS Given data
             * @deprecated
             */
            balenaVersion: process.env.BALENA_HOST_OS_VERSION,
            hypervisorData: this.hypervisorData,
            vpnData: this.vpnData,
            deviceData: this.deviceData,
            nusterVersion: pkg.version,
        };
    }
}