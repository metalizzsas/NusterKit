import { Cycle } from "../controllers/cycle/Cycle";
import { Block } from "./Block";

export class ParameterBlock extends Block implements IParameterBlock
{
    name: string;
    value: string;

    constructor(cycleInstance: Cycle, obj: IParameterBlock)
    {
        super(cycleInstance);

        this.name = obj.name;
        this.value = obj.value;
    }

    public data(): any
    {
        return parseInt(this.value);
    }
}

export class ProfileParameterBlock extends ParameterBlock
{
    constructor(cycleInstance: Cycle, obj: IParameterBlock)
    {
        super(cycleInstance, obj);
    }

    public data(): number
    {
        let val = this.cycleInstance.profileExplorer?.explore(this.value)!;
        return val;
    }   
}

export class ConstantParameterBlock extends ParameterBlock
{
    constructor(cycleInstance: Cycle, obj: IParameterBlock)
    {
        super(cycleInstance, obj)
    }

    public data(): number
    {
        return parseInt(this.value);
    }
}

export class ConstantStringParameterBlock extends ParameterBlock
{
    constructor(cycleInstance: Cycle, obj: IParameterBlock)
    {
        super(cycleInstance, obj);
    }
    public data(): string
    {
        return this.value;
    }
}

export class IOReadParameterBlock extends ParameterBlock
{
    constructor(cycleInstance: Cycle, obj: IParameterBlock)
    {
        super(cycleInstance, obj);
    }

    public data(): number
    {
        return this.cycleInstance.ioExplorer?.explore(this.name)?.value || 0;
    }
}

export interface IParameterBlock
{
    name: string;
    value: string;

    data(): number
}

/**
 * Defines Parameter block properly from configuration object
 * @param cycleInstance cycle instance to attach parameter to 
 * @param obj IParameter json object extracted from configuration file
 * @returns Parameter block defined properly
 */
export function ParameterBlockRegistry(cycleInstance: Cycle, obj: IParameterBlock): ParameterBlock
{
    switch(obj.name)
    {
        case "const": return new ConstantParameterBlock(cycleInstance, obj);
        case "conststr": return new ConstantStringParameterBlock(cycleInstance, obj);
        case "profile": return new ProfileParameterBlock(cycleInstance, obj);
        case "io": return new IOReadParameterBlock(cycleInstance, obj);
        default: {
            console.log("WARNING: Block ", obj.name, "is not defined properly");
            return new ParameterBlock(cycleInstance, obj);
        }
    }
}