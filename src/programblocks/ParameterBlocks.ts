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

        for(const p of obj.params ?? [])
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
        if(val === undefined) this.pbrInstance.machine.logger.warn(`Profile row ${this.value} not found`);
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
        return this.pbrInstance.ioExplorer?.explore(this.value)?.value || 0;
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

export class VariableParameterBlock extends ParameterBlock
{
    constructor(instance: ProgramBlockRunner, obj: IParameterBlock)
    {
        super(instance, obj);
    }

    public data(): number
    {
        if(this.value == "currentStepIndex")
            return this.pbrInstance.currentStepIndex;
        else if(this.value == "currentStepRunCount")
        {
            const step = this.pbrInstance.steps[this.pbrInstance.currentStepIndex];
            if(step)
            {
                const rc = step.runCount;
                return (rc !== undefined) ? rc : 0;
            }
            return 0;
        } 
        else
        {
            this.pbrInstance.machine.logger.warn(`The variable ${this.value} is not defined.`);
            return this.pbrInstance.variables.find(v => v.name == this.value)?.value ?? 0; // this variable might have never been defined
        }
    }
}

export class ConditionalParameterBlock extends ParameterBlock
{
    private operators: {[x: string]: (x: number, y: number) => boolean; } = {
        ">": (x: number, y: number) => x > y,
        "<": (x: number, y: number) => x < y,
        "==": (x: number, y: number) => x == y,
        "!=": (x: number, y: number) => x != y
    };

    constructor(instance: ProgramBlockRunner, obj: IParameterBlock)
    {
        super(instance, obj);
    }

    //return param 2 if condition between param 0 and param 1 is true else it returns params 3
    public data(): number
    {
        if(this.params.length != 4) return 0; //if param count doesnt match for this block return 0
        
        return (this.operators[this.value as string](this.params[0].data() as number, this.params[1].data() as number)) ? this.params[2].data() as number : this.params[3].data() as number;
    }
}

export interface IParameterBlock
{
    name: string;
    value: string;

    params?: IParameterBlock[]

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
        case "conditional": return new ConditionalParameterBlock(pbrInstance, obj);
        case "variable": return new VariableParameterBlock(pbrInstance, obj);

        default: {
            pbrInstance.machine.logger.warn(`Block ${obj.name} is not a defined block`);
            return new ParameterBlock(pbrInstance, obj);
        }
    }
}