import { IManualMode } from "../../interfaces/IManualMode";

export class ManualMode implements IManualMode
{
    name: string;
    controls: string[];
    incompatibility: string[];

    public state = false;

    constructor(name: string, controls: string[], incompatibilty: string[])
    {
        this.name = name;
        this.controls = controls;
        this.incompatibility = incompatibilty;
    }
}