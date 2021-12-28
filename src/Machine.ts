import { IOController } from "./controllers/io/IOController";
import { MaintenanceController } from "./controllers/maintenance/MaintenanceController";
import { ManualModeController } from "./controllers/manual/ManualModeController";
import { ProfileController } from "./controllers/profile/ProfilesController";
import { SlotController } from "./controllers/slot/SlotController";

import fs from "fs";
import path from "path";

import deepExtend from "deep-extend";
import { CycleController } from "./controllers/cycle/CycleController";
import { IProgram } from "./programblocks/ProgramBlockRunner";
import { IProfile } from "./controllers/profile/Profile";
import { IIOGate } from "./controllers/io/IOGates/IOGate";
import { IIOHandler } from "./controllers/io/IOHandlers/IOHandler";
import { IConfigSlot } from "./controllers/slot/Slot";
import { IManualMode } from "./controllers/manual/ManualMode";
import { IConfigMaintenance } from "./controllers/maintenance/Maintenance";
import { PassiveController } from "./controllers/passives/PassiveController";
import { IPassive } from "./controllers/passives/Passive";
import pino from "pino";

export class Machine{

    name: string;
    serial: string;

    model: string;
    variant: string;
    revision: number;

    public specs: IMachine;

    maintenanceController: MaintenanceController;
    ioController: IOController;
    profileController: ProfileController;
    slotController: SlotController;
    manualmodeController: ManualModeController;
    cycleController: CycleController;
    passiveController: PassiveController;

    logger: pino.Logger;

    constructor(logger: pino.Logger)
    {
        this.logger = logger;
        //Loading JSON info file
        const infos = fs.readFileSync(path.resolve("data", "info.json"), {encoding: "utf-8"});

        const parsed = JSON.parse(infos);

        this.name = parsed.name;
        this.serial = parsed.serial;

        this.model = parsed.model;
        this.variant = parsed.variant;
        this.revision = parsed.revision;

        const raw = fs.readFileSync(path.resolve("specs", this.model, this.variant, this.revision + ".json"), {encoding: "utf-8"});

        const specsParsed = JSON.parse(raw);

        //if informations has optionals specs, deep extending it to match all specs
        if(parsed.options !== undefined)
        {
            this.logger.warn("This machine has options");
            deepExtend(specsParsed, parsed.options)
        }

        this.specs = specsParsed;

        this.maintenanceController = new MaintenanceController(this);
        this.ioController = new IOController(this);
        this.profileController = new ProfileController(this);
        this.slotController = new SlotController(this);
        this.manualmodeController = new ManualModeController(this);
        this.cycleController = new CycleController(this);
        this.passiveController = new PassiveController(this);

        this.logger.info("Finished building controllers");

    }

    public configureRouters()
    {
        return true;
    }

    public async  socketData()
    {
        const profiles = await this.profileController.socketData();
        const maintenances = await this.maintenanceController.socketData();

        return {
            "cycle": this.cycleController.socketData,
            "slots": this.slotController.socketData,
            "io": this.ioController.socketData,
            "passives": this.passiveController.socketData,
            //Asyns socketdata
            "profiles": profiles,
            "maintenances": maintenances
        }
    }

    toJSON()
    {
        return {
            name: this.name,
            serial: this.serial,

            model: this.model,
            variant: this.variant,
            revision: this.revision
        };
    }
}

//machine json interface
export interface IMachine
{
    iohandlers: IIOHandler[],
    iogates: IIOGate[],
    slots: IConfigSlot[],
    profiles: IProfile[],
    maintenance: IConfigMaintenance[],
    passives: IPassive[],
    manual: IManualMode[],
    cycles: IProgram[]
}