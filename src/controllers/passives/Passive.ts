import { IPassive } from "../../interfaces/IPassive";
import { Machine } from "../../Machine";
import { IPassiveStoredLogData, PassiveModel } from "./PassiveModel";

const MAXPASSIVELOGPOINTSSTORED = 100;
const MAXPASSIVELOGPOINTSSHOWN = 25;

export class Passive implements IPassive {

    internal?: boolean;

    name: string;

    state: boolean;

    target: number;

    sensors: string | string[];

    actuators: {
        plus: string | string[],
        minus?: string | string[]
    }

    manualModes?: string | string[];

    //Flow control
    machine: Machine;
    controlTimer?: NodeJS.Timer;

    logPassivePoints: IPassiveStoredLogData[] = new Array<IPassiveStoredLogData>(MAXPASSIVELOGPOINTSSTORED);

    constructor(machine: Machine, obj: IPassive) {
        //basic informations

        this.internal = obj.internal;

        this.name = obj.name;
        this.target = obj.target;

        //io
        this.sensors = obj.sensors;
        this.actuators = obj.actuators;

        this.manualModes = obj.manualModes;

        this.machine = machine;

        this.state = false;

        this.createOrModifyPassiveDocument();

        if(this.internal === true)
            this.toggle(true, true);
    }

    async addLogDataPoint() {
        const doc = await PassiveModel.findOne({ name: this.name });

        if(doc !== null)
        {
            const newlogPoint = {
                targetValue: this.target,
                interpolatedSensorsValue: this.currentValue,

                state: this.state,
                time: new Date()
            } as IPassiveStoredLogData;

            //add new logpoint
            this.logPassivePoints.push(newlogPoint);
            //remove first index
            if(this.logPassivePoints.length >= MAXPASSIVELOGPOINTSSTORED)
                this.logPassivePoints.splice(0, 1);

            doc.logData = this.logPassivePoints;
            await doc.save();
        }

        setTimeout(this.addLogDataPoint.bind(this), this.state ? 60000 : 15000);
    }

    async createOrModifyPassiveDocument() {
        const doc = await PassiveModel.findOne({ name: this.name }).slice("logData", -MAXPASSIVELOGPOINTSSTORED);

        if (doc === null) {
            PassiveModel.create({
                name: this.name,
                target: this.target,
                state: this.state
            });
        }
        else
        {
            this.target = doc.target;
            this.state = doc.state;

            this.toggle(this.state);

            this.logPassivePoints = doc.logData;
        }

        this.addLogDataPoint();
    }

    async saveDocument() {
        const doc = await PassiveModel.findOne({ name: this.name });

        if (doc !== null) {
            doc.target = this.target;
            doc.state = this.state;

            await doc.save();
        }
    }

    private regulationLoop() {
        if (this.currentValue > this.target) {
            //disables positive actuators
            if (typeof this.actuators.plus === "string") {
                this.machine.ioController.gFinder(this.actuators.plus)?.write(this.machine.ioController, 0);
            }
            else {
                for (const actuator of this.actuators.plus) {
                    this.machine.ioController.gFinder(actuator)?.write(this.machine.ioController, 0);
                }
            }

            //if this passive has minus Actuators enable them
            if (this.actuators.minus !== undefined) {
                if (typeof this.actuators.minus === "string") {
                    this.machine.ioController.gFinder(this.actuators.minus)?.write(this.machine.ioController, 1);
                }
                else {
                    for (const actuator of this.actuators.minus) {
                        this.machine.ioController.gFinder(actuator)?.write(this.machine.ioController, 1);
                    }
                }
            }
        }
        else {
            //if this passive has minus Actuators disable them
            if (this.actuators.minus !== undefined) {
                if (typeof this.actuators.minus === "string") {
                    this.machine.ioController.gFinder(this.actuators.minus)?.write(this.machine.ioController, 0);
                }
                else {
                    for (const actuator of this.actuators.minus) {
                        this.machine.ioController.gFinder(actuator)?.write(this.machine.ioController, 0);
                    }
                }
            }

            //enable positive actuators
            if (typeof this.actuators.plus === "string") {
                this.machine.ioController.gFinder(this.actuators.plus)?.write(this.machine.ioController, 1);
            }
            else {
                for (const actuator of this.actuators.plus) {
                    this.machine.ioController.gFinder(actuator)?.write(this.machine.ioController, 1);
                }
            }
        }
    }

    /**
     * Enable the passive from its 
     * @param value true enables false disables
     * @param manual Enable manual modes 
     */
    toggle(value: boolean, manual = true) {
        this.state = value;
        this.saveDocument();

        if (this.state === true) {
            this.machine.logger.info("Passive: Enabling " + this.name);

            if (this.controlTimer !== undefined) {
                clearInterval(this.controlTimer);
            }

            //if manual modes are defined, toggle them to 1 & lock them.
            if (this.manualModes && manual) {
                if (typeof this.manualModes == "string") {
                    const manual = this.machine.manualmodeController.find(this.manualModes);

                    manual?.toggle(1);
                    manual?.lock();
                }
                else {
                    for (const mn of this.manualModes) {
                        const manual = this.machine.manualmodeController.find(mn);

                        manual?.toggle(1);
                        manual?.lock();
                    }
                }
            }

            this.controlTimer = setInterval(this.regulationLoop.bind(this), 5000);
        }
        else {
            this.machine.logger.info("Passive: Disabling " + this.name);

            if (this.controlTimer !== undefined) {
                clearInterval(this.controlTimer);
            }

            //if manual modes are defined, toggle them to 0 & unlock them.
            if (this.manualModes && manual) {
                if (typeof this.manualModes == "string") {
                    const manual = this.machine.ioController.machine.manualmodeController.find(this.manualModes);

                    manual?.toggle(0);
                    manual?.unlock();
                }
                else {
                    for (const mn of this.manualModes) {
                        const manual = this.machine.ioController.machine.manualmodeController.find(mn);

                        manual?.toggle(0);
                        manual?.unlock();
                    }
                }
            }
        }
    }

    setTarget(value: number) {
        this.target = value;
        this.saveDocument();
    }

    get currentValue(): number {
        //if there is multiple sensors values return a average values of all of them else return only the sensors value
        if (typeof this.sensors === "string") {
            return this.machine.ioController.gFinder(this.sensors)?.value ?? 0;
        }
        else {
            const values: number[] = this.sensors.map(s => this.machine.ioController.gFinder(s)?.value ?? 0);
            return values.reduce((count, x) => count + x) / this.sensors.length;
        }
    }

    toJSON() {
        return {
            name: this.name,
            target: this.target,
            current: this.currentValue,
            state: this.state,
            logData: this.logPassivePoints.slice(0, (MAXPASSIVELOGPOINTSSTORED - MAXPASSIVELOGPOINTSSHOWN))
        }
    }
}