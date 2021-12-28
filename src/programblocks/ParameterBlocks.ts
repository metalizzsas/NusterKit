import { Block } from "./Block";
import { ProgramBlockRunner } from "./ProgramBlockRunner";

export class ParameterBlock extends Block implements IParameterBlock
{
    name: string;
    value: string;
    params: ParameterBlock[] = [];

    constructor(instance: ProgramBlockRunner, obj: IParameterBlock)
    {
        super(instance);

        this.name = obj.name;
        this.value = obj.value;

        for(const p of obj.params)
        {
            this.params.push(ParameterBlockRegistry(instance, p));
        }
    }

    public data(): unknown
    {
        return parseInt(this.value);
    }

    toJSON()
    {
        return{
            name: this.name,
            value: this.value,
            data: this.data()
        }
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
        const val = this.pbrInstance.profileExplorer.explore(this.value);
        //FIXME: Throw error if the profile row is undefined
        return val ? val : 0;
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
        return parseFloat(this.value);
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

export class AdditionParameterBlock extends ParameterBlock
{
    constructor(instance: ProgramBlockRunner, obj: IParameterBlock)
    {
        super(instance, obj);
    }

    public data(): number
    {
        return (this.params[0].data() as number) + (this.params[1].data() as number);
    }
}

export class MultiplyParameterBlock extends ParameterBlock
{
    constructor(instance: ProgramBlockRunner, obj: IParameterBlock)
    {
        super(instance, obj);
    }

    public data(): number
    {
        return (this.params[0].data() as number) * (this.params[1].data() as number);
    }
}

export class ReverseParameterBlock extends ParameterBlock
{
    constructor(instance: ProgramBlockRunner, obj: IParameterBlock)
    {
        super(instance, obj);
    }
    
    public data(): number
    {
        return this.params[0].data() as number == 1 ? 0 : 1;
    }
}

export interface IParameterBlock
{
    name: string;
    value: string;

    params: IParameterBlock[]

    data(): unknown
}

/**
 * Defines Parameter block properly from configuration object
 * @param pbrInstance PBRInstance to attach blocks to it
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
        case "add": return new AdditionParameterBlock(pbrInstance, obj);
        case "multiply": return new MultiplyParameterBlock(pbrInstance, obj);
        case "reverse": return new ReverseParameterBlock(pbrInstance, obj);
        default: {
            pbrInstance.machine.logger.warn(`Block ${obj.name} is not a defined block`);
            return new ParameterBlock(pbrInstance, obj);
        }
    }
}