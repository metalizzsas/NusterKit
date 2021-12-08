import { Cycle } from "../controllers/cycle/Cycle";
import { Block } from "./Block";
import { ParameterBlock, ProfileParameterBlock, ConstantParameterBlock, IParameterBlock } from "./ParameterBlocks";


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
        this.options = obj.options;

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
                    //FIXME: duplicate of ProgramStep
                    case "for": this.instructions?.push(new ForLoopProgramBlock(this.cycleInstance, i)); break;
                    case "io": this.instructions?.push(new IOAccessProgramBlock(this.cycleInstance, i)); break;
                    case "sleep": this.instructions?.push(new SleepProgramBlock(this.cycleInstance, i)); break;
                    default: this.instructions?.push(new ProgramBlock(this.cycleInstance, i)); break;
                }                
            }
        }
    }

    public async execute(): Promise<any>{}
}

export class ForLoopProgramBlock extends ProgramBlock
{
    constructor(cycleInstance: Cycle, obj: IProgramBlock)
    {
        super(cycleInstance, obj);
    }

    public async execute()
    {
        return new Promise<void>(async (resolve) => {
            for(let i = 0; i < this.params[0].data(); i++)
            {
                for(let instuction of this.instructions!)
                {
                    console.log(typeof instuction);
                    await instuction.execute();
                }
            }
        });
    }
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
                await this.cycleInstance.ioExplorer?.explore(this.options!.gate)!.read(this.cycleInstance.machine.ioController!);
                resolve(this.cycleInstance.ioExplorer?.explore(this.options!.gate)!.value!)
            }
            else
            {
                await this.cycleInstance.ioExplorer?.explore(this.options!.gate)!.write(this.cycleInstance.machine.ioController!, this.params[0].data());
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
            setTimeout(resolve, this.params[0].data() * 1000);
        });
    }
}

enum IOAccessProgramBlockMethod
{
    READ = "read",
    WRITE = "write"
}

export interface IOAccessProgramBlockOptions
{
    gate: string,
    direction: IOAccessProgramBlockMethod
}

export interface IProgramBlock
{
    name: string;
    params: IParameterBlock[];
    instructions?: IProgramBlock[]
    options?: IOAccessProgramBlockOptions;
}