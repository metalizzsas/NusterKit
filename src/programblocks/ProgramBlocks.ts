import { Cycle } from "../controllers/cycle/Cycle";
import { Block } from "./Block";
import { ParameterBlock, ProfileParameterBlock, ConstantParameterBlock, IParameterBlock, ConstantStringParameterBlock, IOReadParameterBlock, ParameterBlockRegistry } from "./ParameterBlocks";

export class ProgramBlock extends Block implements IProgramBlock
{
    name: string;

    params: ParameterBlock[] = [];
    blocks: ProgramBlock[] = [];

    constructor(cycleInstance: Cycle, obj: IProgramBlock)
    {
        super(cycleInstance);

        this.name = obj.name

        if(obj.params !== undefined)
        {
            for(let p of obj.params)
            {
                this.params.push(ParameterBlockRegistry(this.cycleInstance, p));
            }
        }

        if(obj.blocks !== undefined)
        {
            for(let b of obj.blocks)
            {
                this.blocks.push(ProgramBlockRegistry(this.cycleInstance, b));              
            }
        }
    }

    public async execute(): Promise<any>{
        console.log("ProgramBlocks: This Blocks does nothing");
    }
}

export class ForLoopProgramBlock extends ProgramBlock
{
    constructor(cycleInstance: Cycle, obj: IProgramBlock)
    {
        super(cycleInstance, obj);

        if(obj.params.length == 0)
            throw new Error("ForProgramBlock: Not enought parameters")
        if(obj.blocks.length == 0)
            throw Error("ForProgramBlock: No blocks for for loop");
    }

    public async execute()
    {
        return new Promise<void>(async (resolve) => {
            for(let i = 0; i < this.params[0].data(); i++)
            {
                for(let instuction of this.blocks)
                {
                    console.log(typeof instuction);
                    await instuction.execute();
                }
            }
        });
    }
}

export class IfProgramBlock extends ProgramBlock
{
    operators: {[x: string]: Function} = {
        ">": (x: any, y: any) => x > y,
        "<": (x: any, y: any) => x < y,
        "==": (x: any, y: any) => x == y,
        "!=": (x: any, y: any) => x != y
    };

    constructor(cycleInstance: Cycle, obj: IProgramBlock)
    {
        super(cycleInstance, obj);
    }

    public async execute()
    {
        return new Promise<void>(async (resolve) => {
            if(this.operators[this.params[1].value](this.params[0].value, this.params[2].value))
            {
                if(this.blocks !== undefined)
                    await this.blocks[0].execute();
            }
            else
            {
                if(this.blocks !== undefined)
                    await this.blocks[1].execute();
            }
        });
    }
}

export class IOWriteProgramBlock extends ProgramBlock
{
    constructor(cycleInstance: Cycle, obj: IProgramBlock)
    {
        super(cycleInstance, obj);
    }

    public async execute(): Promise<void>
    {
        return new Promise(async (resolve, _reject) => {

            await this.cycleInstance.ioExplorer?.explore(this.params[0].data())?.write(this.cycleInstance.machine.ioController!, this.params[1].data());

            resolve();
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
            setTimeout(resolve, this.params[0].data() * 1000);
        });
    }
}

export interface IProgramBlock
{
    name: string;
    params: IParameterBlock[];
    blocks: IProgramBlock[];
}

export function ProgramBlockRegistry(cycleInstance: Cycle, obj: IProgramBlock)
{
    switch(obj.name)
    {
        case "for": return new ForLoopProgramBlock(cycleInstance, obj);
        case "if": return new IfProgramBlock(cycleInstance, obj);
        case "sleep": return new SleepProgramBlock(cycleInstance, obj);
        case "io": return new IOWriteProgramBlock(cycleInstance, obj);
        default: {
            console.log("WARNING: Program block", obj.name, "is not defined properly");
            return new ProgramBlock(cycleInstance, obj);
        }
    }
}