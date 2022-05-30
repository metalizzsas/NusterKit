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

import type { IConfiguration, IMachine, IMachineSettings } from "./interfaces/IMachine";
import type { IHypervisorData } from "./interfaces/balena/IHypervisorDevice";

export class Machine {

    name: string;
    serial: string;

    model: string;
    variant: string;
    revision: number;

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

    hypervisorData?: IHypervisorData;

    constructor(logger: pino.Logger)
    {
        this.logger = logger;
        this.authManager = new AuthManager(this.logger);

        //Get info file path
        const infoPath = (process.env.NODE_ENV != 'production' || process.env.FORCE_DEV_CONFIG == 'true') ? path.resolve("data", "info.json") : "/data/info.json";

        if(!fs.existsSync(infoPath))
        {
            this.logger.fatal("Machine: info file not found");
            throw Error("Machine: info file not found");
        }

        const infos = fs.readFileSync(infoPath, {encoding: "utf-8"});
        const parsed = JSON.parse(infos) as IConfiguration;

        this.name = parsed.name;
        this.serial = parsed.serial;

        this.model = parsed.model;
        this.variant = parsed.variant;
        this.revision = parsed.revision;

        const raw = fs.readFileSync(path.resolve("nuster-turbine-machines", "data", this.model, this.variant, `${this.revision}`, "specs.json"), {encoding: "utf-8"});
        const specsParsed = JSON.parse(raw) as IMachine;

        //if informations has optionals specs, deep extending it to match all specs
        if(parsed.options !== undefined)
        {
            this.logger.warn("Machine: Configuration has options, merging with specs.");
            deepExtend(specsParsed, parsed.options);
        }

        this.specs = (specsParsed as IMachine);

        //if config file has settings let them is the settings var
        if(parsed.settings !== undefined)
        {
            this.logger.warn("This machine has custom settings.");
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

        //Polling the hypervisor to get container health.
        setInterval(async () => {
            try
            {
                const hyperv = await fetch("http://127.0.0.1:48484/v2/state/status?apikey=" + process.env.BALENA_SUPERVISOR_API_KEY, {headers: {"Content-Type": "application/json"}});
    
                if(hyperv.status == 200)
                    this.hypervisorData = await hyperv.json();
            }
            catch(ex)
            {
                this.logger.warn("Hypervisor: Failed to get Hypervisor data.");
            }
        }, 10000);
    }

    public broadcast(message: string)
    {
        if(this.WebSocketServer !== undefined)
        {
            this.logger.trace("Broadcasting WS Message: " + message);
            for(const client of this.WebSocketServer.clients)
            {
                client.send(JSON.stringify({
                    type: "message",
                    message: message
                }));
            }
        }
        else
        {
            this.logger.trace("Websocket: Unable to broadcast, WebSocket server is undefined.");
        }
    }

    public async socketData()
    {
        const profiles = await this.profileController.socketData();
        const maintenances = await this.maintenanceController.socketData();

        return {
            "machine": this.toJSON(),
            "cycle": this.cycleController.socketData,
            "slots": this.slotController.socketData,
            "io": this.ioController.socketData[0],
            "handlers": this.ioController.socketData[1],
            "passives": this.passiveController.socketData,
            "manuals": this.manualmodeController.socketData,
            "profiles": profiles,
            "maintenances": maintenances
        }
    }

    get assetsFolder()
    {
        return path.resolve("nuster-turbine-machines", "data", this.model, this.variant, `${this.revision}`, "assets");
    }

    toJSON()
    {
        return {
            name: this.name,
            serial: this.serial,

            model: this.model,
            variant: this.variant,
            revision: this.revision,

            balenaVersion: process.env.BALENA_HOST_OS_VERSION,
            hypervisorData: this.hypervisorData,
            nusterVersion: pkg.version,

            settings: this.settings
        };
    }
}