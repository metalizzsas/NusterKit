import { IOController } from "../controllers/IOController";
import { MaintenanceController } from "../controllers/MaintenanceController";
import { ManualModeController } from "../controllers/ManualModeController";
import { ProfileController } from "../controllers/ProfilesController";
import { SlotController } from "../controllers/SlotController";

export class Machine{

    model: string;
    variant: string;
    revision: number;
    serial: string;

    maintenanceController?: MaintenanceController;
    ioController?: IOController;
    profileController?: ProfileController;
    slotController?: SlotController;
    manualmodeController?: ManualModeController

    constructor(model: string, variant: string, revision: number, serial: string)
    {
        this.model = model;
        this.variant = variant;
        this.revision = revision;
        this.serial = serial;
    }

    public configureRouters()
    {
        this.maintenanceController = new MaintenanceController(this);
        this.ioController = new IOController(this);
        this.profileController = new ProfileController(this);
        this.slotController = new SlotController(this);
        this.manualmodeController = new ManualModeController(this);

        return true;
    }
}