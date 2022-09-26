import pino from "pino";
import fs from "fs";
import path from "path";
import deepExtend from "deep-extend";
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
import { AuthManager } from "./auth/auth";
import { parseAddon } from "./addons/AddonLoader";

import type { IConfiguration, IMachine, IMachineSettings } from "./interfaces/IMachine";
import type { IAddon } from "./interfaces/IAddon";
import type { IHypervisorData } from "./interfaces/balena/IHypervisorDevice";
import type { IVPNData } from "./interfaces/balena/IVPNData";
import type { IDeviceData } from "./interfaces/balena/IDeviceData";
import { INusterPopup } from "./interfaces/nusterData/INusterPopup";

export class Machine {

    name: string;
    serial: string;

    model: string;
    variant: string;
    revision: number;

    addons?: string[];

    public specs: IMachine;
    public settings: IMachineSettings = {
        maskedPremades: [],
        maskedProfiles: [],
        maskedManuals: [],
        ioControlsMasked: false
    };

    maintenanceController: MaintenanceController;
    ioController: IOController;
    profileController: ProfileController;
    slotController: SlotController;
    manualmodeController: ManualModeController;
    cycleController: CycleController;
    passiveController: PassiveController;

    WebSocketServer?: WebSocket.Server = undefined;

    logger: pino.Logger;

    authManager: AuthManager;

    //Balena given data
    hypervisorData?: IHypervisorData;
    vpnData?: IVPNData;
    deviceData?: IDeviceData;

    constructor(logger: pino.Logger)
    {
        this.logger = logger;
        this.authManager = new AuthManager(this.logger);

        //Get info file path
        const infoPath = (process.env.NODE_ENV != 'production' || process.env.FORCE_DEV_CONFIG == 'true') ? path.resolve("data", "info.json") : "/data/info.json";

        if(!fs.existsSync(infoPath))
        {
            this.logger.fatal("Machine: Info file not found");
            throw Error("Machine: Info file not found");
        }

        const infos = fs.readFileSync(infoPath, {encoding: "utf-8"});
        const parsed = JSON.parse(infos) as IConfiguration;

        this.name = parsed.name;
        this.serial = parsed.serial;

        this.model = parsed.model;
        this.variant = parsed.variant;
        this.revision = parsed.revision;

        this.addons = parsed.addons;

        const raw = fs.readFileSync(path.resolve(this.baseNTMFolder, "specs.json"), {encoding: "utf-8"});
        const specsParsed = JSON.parse(raw) as IMachine;

        //if informations has optionals specs, deep extending it to match all specs
        if(parsed.options !== undefined && parsed.options !== null)
        {
            this.logger.info("Machine: Configuration has options, merging with specs.");
            deepExtend(specsParsed, parsed.options);
        }

        this.specs = (specsParsed as IMachine);

        //If this machine as addons
        if(this.addons !== undefined && this.addons.length > 0)
        {
            this.logger.warn("Machine: " + this.addons.length + " Addon detected. SHOULD NOT BE USED IN PRODUCTION!");
            for(const add of this.addons)
            {
                const rawAddon = fs.readFileSync(path.resolve(this.baseNTMFolder, "addons", add + ".json"), {encoding: 'utf-8'});

                const addonParsed = JSON.parse(rawAddon) as IAddon;

                this.specs = parseAddon(this.specs, addonParsed, this.logger);
            }
        }

        //if config file has settings let them is the settings var
        if(parsed.settings !== undefined)
        {
            this.logger.info("Machine: Custom settings detected.");
            this.settings = parsed.settings;
        }

        this.maintenanceController = new MaintenanceController(this);
        this.ioController = new IOController(this);
        this.profileController = new ProfileController(this);
        this.slotController = new SlotController(this);
        this.manualmodeController = new ManualModeController(this);
        this.cycleController = new CycleController(this);
        this.passiveController = new PassiveController(this);

        this.logger.info("Machine: Finished building controllers");

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
                    this.logger.warn("Hypervisor: Failed to get Hypervisor data.");
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
            this.logger.info(`Websocket: Displaying popup ${popupData.message}.`);

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
            this.logger.warn("Websocket: Unable to send popup, Websocket server is not defined.");
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
        return path.resolve("nuster-turbine-machines", "data", this.model, this.variant, `${this.revision}`);
    }

    toJSON()
    {
        return {
            name: this.name,
            serial: this.serial,

            model: this.model,
            variant: this.variant,
            revision: this.revision,

            addons: this.addons,

            /** 
             * BalenaOS Given data
             * @deprecated
             */
            balenaVersion: process.env.BALENA_HOST_OS_VERSION,
            hypervisorData: this.hypervisorData,
            vpnData: this.vpnData,
            deviceData: this.deviceData,

            nusterVersion: pkg.version,
            settings: this.settings
        };
    }
}