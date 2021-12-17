import { Block } from "./Block";
import { ProgramBlockRunner } from "./ProgramBlockRunner";

export class ParameterBlock extends Block implements IParameterBlock
{
    name: string;
    value: string;

    constructor(instance: ProgramBlockRunner, obj: IParameterBlock)
    {
        super(instance);

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
    constructor(instance: ProgramBlockRunner, obj: IParameterBlock)
    {
        super(instance, obj);
    }

    public data(): number
    {
        const val = this.pbrInstance.profileExplorer.explore(this.value)!;
        return val;
    }   
}

export class ConstantParameterBlock extends ParameterBlock
{
    constructor(instance: ProgramBlockRunner, obj: IParameterBlock)
    {
        super(instance, obj);
    }

    public data(): number
    {
        return parseInt(this.value);
    }
}

export class ConstantStringParameterBlock extends ParameterBlock
{
    constructor(instance: ProgramBlockRunner, obj: IParameterBlock)
    {
        super(instance, obj);
    }

    public data(): string
    {
        return this.value;
    }
}

export class IOReadParameterBlock extends ParameterBlock
{
    constructor(instance: ProgramBlockRunner, obj: IParameterBlock)
    {
        super(instance, obj);
    }

    public data(): number
    {
        return this.pbrInstance.ioExplorer?.explore(this.name)?.value || 0;
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
export function ParameterBlockRegistry(pbrInstance: ProgramBlockRunner, obj: IParameterBlock): ParameterBlock
{
    switch(obj.name)
    {
        case "const": return new ConstantParameterBlock(pbrInstance, obj);
        case "conststr": return new ConstantStringParameterBlock(pbrInstance, obj);
        case "profile": return new ProfileParameterBlock(pbrInstance, obj);
        case "io": return new IOReadParameterBlock(pbrInstance, obj);
        default: {
            console.log("WARNING: Block ", obj.name, "is not defined properly");
            return new ParameterBlock(pbrInstance, obj);
        }
    }
}