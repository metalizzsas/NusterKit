import { MaintenanceController } from "../controllers/MaintenanceController";

export class Machine{

    model: string;
    variant: string;
    revision: number;
    serial: string;

    maintenanceController?: MaintenanceController;

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

        return true;
    }
}