import type { IPassiveHydrated, IPassiveStoredLogData } from "@metalizzsas/nuster-typings/build/hydrated/passive";
import type { IConfigPassive } from "@metalizzsas/nuster-typings/build/spec/passive";
import { LoggerInstance } from "../../app";
import { IOController } from "../io/IOController";
import { ManualModeController } from "../manual/ManualModeController";
import { PassiveModel } from "./PassiveModel";

const MAXPASSIVELOGPOINTSSTORED = 100;
const MAXPASSIVELOGPOINTSSHOWN = 25;

export class Passive implements IConfigPassive {

    internal?: true;

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
    controlTimer?: NodeJS.Timer;

    logPassivePoints: IPassiveStoredLogData[] = new Array<IPassiveStoredLogData>();

    constructor(obj: IConfigPassive) {

        this.internal = obj.internal;

        this.name = obj.name;
        this.target = obj.target;

        //io
        this.sensors = obj.sensors;
        this.actuators = obj.actuators;

        this.manualModes = obj.manualModes;

        this.state = false;

        if(this.internal === true)
            this.toggle(true, true);
        else
            this.createOrModifyPassiveDocument();

        //start logpoint loop
        this.addLogDataPoint();
    }

    /** Add a log point to the data */
    private addLogDataPoint()
    {
        const newlogPoint: IPassiveStoredLogData = {
            targetValue: this.target,
            interpolatedSensorsValue: this.currentValue,

            state: this.state,
            time: new Date().toISOString()
        };

        //add new logpoint
        this.logPassivePoints.push(newlogPoint);

        //remove first index
        if(this.logPassivePoints.length >= MAXPASSIVELOGPOINTSSTORED)
            this.logPassivePoints.splice(0, 1);

        //resets the call stack - Add a new point
        setTimeout(this.addLogDataPoint.bind(this), 15000);
    }

    private async createOrModifyPassiveDocument() {
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
        }
    }

    private async saveDocument() {
        const doc = await PassiveModel.findOne({ name: this.name });

        if (doc !== null) {
            doc.target = this.target;
            doc.state = this.state;

            await doc.save();
        }
    }

    private regulationLoop() {

        //If current value is more than target + 0.25
        //enable minus actuators
        if(this.currentValue > this.target + 0.25)
            this.setActuators("minus", true);
        else
            this.setActuators("minus", false);

        //if current value in less than target
        // enable plus actuators otherwise disable plus actuators
        if(this.currentValue < this.target)
            this.setActuators("plus", true)
        else
            this.setActuators("plus", false);
    }

    /**
     * Sets the actuators to the designed set
     * @param actuators actuators to be modified
     * @param state state to be set
     */
    private async setActuators(actuators: "minus" | "plus", state: boolean)
    {
        const acturatorsElement = this.actuators[actuators];

        if (acturatorsElement !== undefined)
        {
            if (typeof acturatorsElement === "string")
            {
                await IOController.getInstance().gFinder(acturatorsElement)?.write(state === true ? 1 : 0);
            }
            else
            {
                for (const actuator of acturatorsElement) {
                    await IOController.getInstance().gFinder(actuator)?.write(state === true ? 1 : 0);
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
            LoggerInstance.info("Passive: Enabling " + this.name);

            if (this.controlTimer !== undefined) {
                clearInterval(this.controlTimer);
            }

            //if manual modes are defined, toggle them to 1 & lock them.
            if (this.manualModes && manual) {
                if (typeof this.manualModes == "string") {
                    const manual = ManualModeController.getInstance().find(this.manualModes);

                    manual?.toggle(1);
                    manual?.lock();
                }
                else {
                    for (const mn of this.manualModes) {
                        const manual = ManualModeController.getInstance().find(mn);

                        manual?.toggle(1);
                        manual?.lock();
                    }
                }
            }

            this.controlTimer = setInterval(this.regulationLoop.bind(this), 5000);
        }
        else {
            LoggerInstance.info("Passive: Disabling " + this.name);

            if (this.controlTimer !== undefined) {
                clearInterval(this.controlTimer);
            }

            //if manual modes are defined, toggle them to 0 & unlock them.
            if (this.manualModes && manual) {
                if (typeof this.manualModes == "string") {
                    const manual = ManualModeController.getInstance().find(this.manualModes);

                    manual?.toggle(0);
                    manual?.unlock();
                }
                else {
                    for (const mn of this.manualModes) {
                        const manual = ManualModeController.getInstance().find(mn);

                        manual?.toggle(0);
                        manual?.unlock();
                    }
                }
            }

            this.setActuators("minus", false);
            this.setActuators("plus", false);
        }
    }

    setTarget(value: number) {
        this.target = value;
        this.saveDocument();
    }

    get currentValue(): number {
        //if there is multiple sensors values return a average values of all of them else return only the sensors value
        if (typeof this.sensors === "string") {
            return IOController.getInstance().gFinder(this.sensors)?.value ?? 0;
        }
        else {
            const values: number[] = this.sensors.map(s => IOController.getInstance().gFinder(s)?.value ?? 0);
            return values.reduce((count, x) => count + x) / this.sensors.length;
        }
    }

    toJSON(): IPassiveHydrated
    {
        return {
            name: this.name,
            target: this.target,
            current: this.currentValue,
            state: this.state,
            logData: this.logPassivePoints.slice(0, (MAXPASSIVELOGPOINTSSTORED - MAXPASSIVELOGPOINTSSHOWN))
        }
    }
}