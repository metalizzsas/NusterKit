import { Cycle, ICycle } from "../controllers/cycle/Cycle";
import { Machine } from "../Machine";
import util from "util";

import _, { isNull } from "lodash";
import { Controller } from "../controllers/Controller";

export class BlockProgramInterpreter
{
    cycleInstance: Cycle;

    name: string;
    machine: Machine;


    cycle?: ProgramBlockRunner;

    constructor(cycleInstance: Cycle, name: string, machine: Machine)
    {
        this.cycleInstance = cycleInstance;
        this.name = name;
        this.machine = machine;

        let index = this.machine.specs.cycle.findIndex((c) => c.name == this.name);

        if(index > -1)
        {
            //this.cycle = new ProgramBlockRunner(this.machine.specs.cycle[index].name, this.machine.specs.cycle[index].steps);
            
            //this.cycle = _.merge(new ProgramBlockRunner("", []), this.machine.specs.cycle[index]);

            this.cycle = new ProgramBlockRunner(this.cycleInstance, this.machine.specs.cycle[index]);  
            
            console.log(this.cycle);
        }
    }

    async start()
    {
        for(let step of this.cycle!.steps)
        {
            for(let block of step.blocks)
            {
                console.log("executing", block.name, "in", step.name);
                console.log(block.constructor.name);
                await block.execute(this.cycleInstance);
            }
        }
    }
}

class ProgramBlockRunner implements IProgram
{
    name: string;
    cycle: Cycle;
    steps: ProgramBlockStep[] = [];

    constructor(cycleInstance: Cycle, object: IProgram)
    {
        this.cycle = cycleInstance;
        this.name = object.name;

        for(let step of object.steps)
        {
            this.steps.push(new ProgramBlockStep(this.cycle, step));
        }
    }
}

class ProgramBlockStep implements IProgramStep
{
    cycle: Cycle;

    name: string;
    isEnabled: ParameterBlock;
    duration: ParameterBlock;
    
    blocks: ProgramBlock[] = [];

    constructor(cycleInstance: Cycle, obj: IProgramStep)
    {
        this.cycle = cycleInstance;
        this.name = obj.name
        this.isEnabled = new ParameterBlock(this.cycle, obj.isEnabled)
        this.duration = new ParameterBlock(this.cycle, obj.duration);

        for(let block of obj.blocks)
        {
            this.blocks.push(new ProgramBlock(this.cycle, block))
        }
    }
}

class Block
{
    cycleInstance: Cycle
    constructor(cycleInstance: Cycle)
    {
        this.cycleInstance = cycleInstance;
    }
}

export class ProgramBlock extends Block implements IProgramBlock
{
    name: string;

    params: ParameterBlock[] = [];
    instructions?: ProgramBlock[] = [];
    options?: IOAccessProgramBlockOptions;

    constructor(cycleInstance: Cycle, obj: IProgramBlock)
    {
        super(cycleInstance);

        this.name = obj.name

        if(obj.params !== undefined)
        {
            for(let p of obj.params)
            {
                switch(p.name)
                {
                    case "profile": this.params.push(new ProfileParameterBlock(this.cycleInstance, p)); break;
                    case "const": this.params.push(new ConstantParameterBlock(this.cycleInstance, p)); break;
                    default: this.params.push(new ParameterBlock(this.cycleInstance, p)); break;
                }
            }
        }

        if(obj.instructions !== undefined)
        {
            for(let i of obj.instructions)
            {
                console.log(i.name);
                switch(i.name)
                {
                    case "for": this.instructions?.push(new ForLoopProgramBlock(this.cycleInstance, i)); break;
                    case "io": this.instructions?.push(new IOAccessProgramBlock(this.cycleInstance, i)); break;
                    case "sleep": this.instructions?.push(new SleepProgramBlock(this.cycleInstance, i)); break;
                    default: this.instructions?.push(new ProgramBlock(this.cycleInstance, i)); break;
                }                
            }
        }
    }

    public async execute(cycleInstance: Cycle): Promise<any>
    {}
}

export class ForLoopProgramBlock extends ProgramBlock
{
    constructor(cycleInstance: Cycle, obj: IProgramBlock)
    {
        super(cycleInstance, obj);
    }

    public async execute(cycleInstance: Cycle)
    {
        return new Promise<void>(async (resolve) => {
            for(let i = 0; i < this.params[0].data(); i++)
            {
                for(let instuction of this.instructions!)
                {
                    console.log(typeof instuction);
                    await instuction.execute(cycleInstance);
                }
            }
        });
    }
}

enum IOAccessProgramBlockMethod
{
    READ = "read",
    WRITE = "write"
}

interface IOAccessProgramBlockOptions
{
    gate: string,
    direction: IOAccessProgramBlockMethod
}

export class IOAccessProgramBlock extends ProgramBlock
{
    constructor(cycleInstance: Cycle, obj: IProgramBlock)
    {
        super(cycleInstance, obj);
    }

    public async execute(): Promise<number>
    {
        return new Promise(async (resolve, reject) => {
            if(this.options!.direction == IOAccessProgramBlockMethod.READ)
            {
                await this.cycleInstance.ioExplorer?.explore(this.options!.gate)!.read();
                resolve(this.cycleInstance.ioExplorer?.explore(this.options!.gate)!.value!)
            }
            else
            {
                await this.cycleInstance.ioExplorer?.explore(this.options!.gate)!.write(this.params[0].data());
                resolve(0);
            }
        });
    }
}

export class SleepProgramBlock extends ProgramBlock
{
    constructor(cycleInstance: Cycle, obj: IProgramBlock)
    {
        super(cycleInstance, obj)
    }

    public execute(): Promise<void>
    {
        return new Promise((resolve) => {
            console.log(this.params[0].data());
            setTimeout(resolve, this.params[0].data() * 1000);
        });
    }
}

class ParameterBlock extends Block implements IParameterBlock
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

export interface IProgram
{
    name: string;
    cycle: Cycle;
    steps: IProgramStep[];
}

interface IProgramStep
{
    name: string;
    isEnabled: IParameterBlock;
    duration: IParameterBlock;
    blocks: IProgramBlock[]
}

interface IParameterBlock
{
    name: string;
    value: string;

    data(): number
}

interface IProgramBlock
{
    name: string;
    params: IParameterBlock[];
    instructions?: IProgramBlock[]
    options?: IOAccessProgramBlockOptions;
}