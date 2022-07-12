import { model, Schema } from "mongoose";
import { EIOGateNames } from "../../interfaces/gates/IIOGate";
import { IPassive } from "../../interfaces/IPassive";
import { Machine } from "../../Machine";

export class Passive implements IPassive
{
    name: string;

    state: boolean;

    //passive setpoint
    target: number;

    sensors: EIOGateNames | EIOGateNames[];

    actuators: {
        plus: EIOGateNames | EIOGateNames[],
        minus?: EIOGateNames | EIOGateNames[]
    }

    manualModes?: string | string[];

    //flow controls
    machine: Machine;
    controlTimer?: NodeJS.Timer;

    constructor(machine: Machine, obj: IPassive)
    {
        //basic informations
        this.name = obj.name;
        this.target = obj.target;

        //io
        this.sensors = obj.sensors;
        this.actuators = obj.actuators;

        this.manualModes = obj.manualModes;

        this.machine = machine;

        this.state = false;

        this.createOrModifyPassiveDocument();
    }

    async createOrModifyPassiveDocument()
    {
        const doc = await PassiveModel.findOne({ name: this.name });

        if(doc === null)
        {
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
        }
    }

    async saveDocument()
    {
        const doc = await PassiveModel.findOne({ name: this.name });

        if(doc !== null)
        {
            doc.target = this.target;
            doc.state = this.state;

            await doc.save();
        }
    }

    /**
     * Enable the passive from its 
     * @param value true enables false disables
     */
    toggle(value: boolean)
    {
        this.state = value;
        this.saveDocument();

        if(this.state === true)
        {
            if(this.controlTimer !== undefined)
            {
                clearInterval(this.controlTimer);
            }
            else
            {
                //if manual modes are defined, toggle them to 1 & lock them.
                if(this.manualModes)
                {
                    if(typeof this.manualModes == "string")
                    {
                        const manual  = this.machine.manualmodeController.find(this.manualModes);

                        manual?.toggle(1);
                        manual?.lock();
                    }
                    else
                    {
                        for(const mn of this.manualModes)
                        {
                            const manual = this.machine.manualmodeController.find(mn);

                            manual?.toggle(1);
                            manual?.lock();
                        }
                    }
                }

                this.controlTimer = setInterval(() => {
                    if(this.target > this.currentValue)
                    {
                        //disables positive actuators
                        if(typeof this.actuators.plus === "string")
                        {
                            this.machine.ioController.gFinder(this.actuators.plus)?.write(this.machine.ioController, 0);
                        }
                        else
                        {
                            for(const actuator of this.actuators.plus)
                            {
                                this.machine.ioController.gFinder(actuator)?.write(this.machine.ioController, 0);
                            }
                        }

                        //if this passive has minus Actuators enable them
                        if(this.actuators.minus !== undefined)
                        {
                            if(typeof this.actuators.minus === "string")
                            {
                                this.machine.ioController.gFinder(this.actuators.minus)?.write(this.machine.ioController, 1);
                            }
                            else
                            {
                                for(const actuator of this.actuators.minus)
                                {
                                    this.machine.ioController.gFinder(actuator)?.write(this.machine.ioController, 1);
                                }
                            } 
                        }
                    }
                    else
                    {
                        //if this passive has minus Actuators disable them
                        if(this.actuators.minus !== undefined)
                        {
                            if(typeof this.actuators.minus === "string")
                            {
                                this.machine.ioController.gFinder(this.actuators.minus)?.write(this.machine.ioController, 0);
                            }
                            else
                            {
                                for(const actuator of this.actuators.minus)
                                {
                                    this.machine.ioController.gFinder(actuator)?.write(this.machine.ioController, 0);
                                }
                            } 
                        }

                        //enable positive actuators
                        if(typeof this.actuators.plus === "string")
                        {
                            this.machine.ioController.gFinder(this.actuators.plus)?.write(this.machine.ioController, 1);
                        }
                        else
                        {
                            for(const actuator of this.actuators.plus)
                            {
                                this.machine.ioController.gFinder(actuator)?.write(this.machine.ioController, 1);
                            }
                        }
                    }
                }, 5000);
            }
        }
        else
        {
            if(this.controlTimer !== undefined)
            {
                clearInterval(this.controlTimer);
            }

            //if manual modes are defined, toggle them to 0 & unlock them.
            if(this.manualModes)
            {
                if(typeof this.manualModes == "string")
                {
                    const manual  = this.machine.ioController.machine.manualmodeController.find(this.manualModes);

                    manual?.toggle(0);
                    manual?.unlock();
                }
                else
                {
                    for(const mn of this.manualModes)
                    {
                        const manual = this.machine.ioController.machine.manualmodeController.find(mn);

                        manual?.toggle(0);
                        manual?.unlock();
                    }
                }
            }
        }
    }

    setTarget(value: number)
    {
        this.target = value;
        this.saveDocument();
    }

    get currentValue(): number
    {
        //if there is multiple sensors values return a average values of all of them else return only the sensors value
        if(typeof this.sensors === "string")
        {
            return this.machine.ioController.gFinder(this.sensors)?.value ?? 0;
        }
        else
        {
            const values: number[] = this.sensors.map(s => this.machine.ioController.gFinder(s)?.value ?? 0);
            return values.reduce((count, x) => count + x) / this.sensors.length;
        }
    }

    toJSON()
    {
        return {
            name: this.name,
            target: this.target,
            current: this.currentValue,
            state: this.state
        }
    }
}

interface IPassiveStored
{
    name: string;
    target: number;
    state: boolean;
}

const PassiveSchema = new Schema<IPassiveStored>({
    name: {type: String, required: true},
    target: {type: Number, required: true},
    state: {type: Boolean, required: true}
});

const PassiveModel = model("passive", PassiveSchema);
