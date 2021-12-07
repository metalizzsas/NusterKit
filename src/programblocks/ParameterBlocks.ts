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

    public data(): number
    {
        return parseInt(this.value);
    }
}

export class ProfileParameterBlock extends ParameterBlock implements IParameterBlock
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

export interface IParameterBlock
{
    name: string;
    value: string;

    data(): number
}
