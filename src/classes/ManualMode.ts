interface IManualMode
{
    name: string,
    controls: string[],
    incompatibility: string[]
}

export class ManualMode
{
    name: string;
    controls: string[];
    incompatibility: string[];

    public state: boolean = false;

    constructor(name: string, controls: string[], incompatibilty: string[])
    {
        this.name = name;
        this.controls = controls;
        this.incompatibility = incompatibilty;

    }
}