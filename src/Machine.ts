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

export class Machine{

    name: string;
    serial: string;

    model: string;
    variant: string;
    revision: number;

    public specs: IMachine;

    maintenanceController?: MaintenanceController;
    ioController?: IOController;
    profileController?: ProfileController;
    slotController?: SlotController;
    manualmodeController?: ManualModeController
    cycleController?: CycleController

    constructor()
    {
        //Loading JSON info file
        let infos = fs.readFileSync(path.resolve("data", "info.json"), {encoding: "utf-8"});

        let parsed = JSON.parse(infos);

        this.name = parsed.name;
        this.serial = parsed.serial;

        this.model = parsed.model;
        this.variant = parsed.variant;
        this.revision = parsed.revision;

        let raw = fs.readFileSync(path.resolve("specs", this.model, this.variant, this.revision + ".json"), {encoding: "utf-8"});

        let specsParsed = JSON.parse(raw);

        //if informations has optionals specs, deep extending it to match all specs
        if(parsed.options !== undefined)
        {
            deepExtend(specsParsed, parsed.options)
        }

        this.specs = specsParsed;
    }

    public configureRouters()
    {
        this.maintenanceController = new MaintenanceController(this);
        this.ioController = new IOController(this);
        this.profileController = new ProfileController(this);
        this.slotController = new SlotController(this);
        this.manualmodeController = new ManualModeController(this);
        this.cycleController = new CycleController(this);

        return true;
    }

    public get socketData()
    {
        return {
            "cycle": this.cycleController?.socketData,
            "slots": this.slotController?.socketData,
            "io": this.ioController?.socketData
        }
    }

    public get io()
    {
        return this.ioController;
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
interface IMachine
{
    iohandlers: any,
    iogates: any,
    slots: any,
    profiles: [IProfile],
    maintenance: any,
    passives: any,
    manual: any,
    cycles: IProgram[]
}