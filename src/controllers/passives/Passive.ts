import { model, Schema } from "mongoose";
import { EventEmitter } from "stream";
import { IOController } from "../io/IOController";

export class Passive implements IPassive
{
    name: string;
    mode: string;
    default: number;

    sensor: string;
    actuator: string;

    private ioController: IOController;

    //Elements to handle passive management
    private event: EventEmitter;
    private enabled = false;
    private timer?: NodeJS.Timer;

    private modes: {[x: string]: (x: number, y: number) => boolean} = {
        ">": (x: number, y: number) => x > y,
        "<": (x: number, y: number) => x < y
    }

    constructor(ioController: IOController, obj: IPassive)
    {
        this.ioController = ioController;

        this.name = obj.name;
        this.default = obj.default;
        this.mode = obj.mode;

        this.sensor = obj.sensor;
        this.actuator = obj.actuator;

        this.event = new EventEmitter();

        PassiveModel.findOne({name: this.name}, {}, {}, (err) => {
            if(err)
                PassiveModel.create({name: this.name, value: this.default});  
        });
        
        this.event.on("state-change", (state) => {

            if(this.timer && state == false)
                clearInterval(this.timer);
            else if(this.timer && state == true)
                return
            else if (!this.timer && state == true)
                this.timer = setInterval(async () => {

                    const gateActuator = this.ioController.gFinder(this.actuator);
                    const gateSensor = this.ioController.gFinder(this.sensor);

                    if(gateActuator && gateSensor)
                    {
                        gateActuator.write(this.ioController, (this.modes[this.mode](gateSensor.value, await this.value()) ? 1 : 0));
                    }

                }, 1000);
        });
    }

    async value(): Promise<number>
    {
        const doc = await PassiveModel.findOne({name: this.name});

        if(doc)
        {
            return doc.value;
        }
        return this.default;
    }

    set isEnabled(state: boolean)
    {
        this.event.emit("state-change", state);
    }
    get isEnabled()
    {
        return this.enabled;
    }

    toJSON()
    {
        return {
            name: this.name,
            mode: this.mode,
            default: this.default,

            enabled: this.enabled,

            sensor: this.sensor,
            actuator: this.actuator
        }
    }
}

export interface IPassive
{
    name: string;
    mode: string;
    default: number;

    //gates
    sensor: string;
    actuator: string;
}

interface IStoredPassive
{
    name: string;
    value: number;
}

const PassiveSchema = new Schema<IStoredPassive>({
    name: { type: String, required: true},
    value: { type: Number, required: true}
});

export const PassiveModel = model("Passives", PassiveSchema);