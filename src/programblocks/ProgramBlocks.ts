import { Block } from "./Block";
import { ParameterBlock, IParameterBlock, ParameterBlockRegistry } from "./ParameterBlocks";
import { ProgramBlockRunner } from "./ProgramBlockRunner";

export class ProgramBlock extends Block implements IProgramBlock
{
    name: string;

    params: ParameterBlock[] = [];
    blocks: ProgramBlock[] = [];

    constructor(pbrInstance: ProgramBlockRunner, obj: IProgramBlock)
    {
        super(pbrInstance);

        this.name = obj.name

        if(obj.params !== undefined)
        {
            for(const p of obj.params)
            {
                this.params.push(ParameterBlockRegistry(this.pbrInstance, p));
            }
        }

        if(obj.blocks !== undefined)
        {
            for(const b of obj.blocks)
            {
                this.blocks.push(ProgramBlockRegistry(this.pbrInstance, b));              
            }
        }
    }

    public async execute(): Promise<unknown>{
        this.pbrInstance.machine.logger.info(`This Programblock does nothing`);

        return;
    }
}

export class ForLoopProgramBlock extends ProgramBlock
{
    constructor(pbrInstance: ProgramBlockRunner, obj: IProgramBlock)
    {
        super(pbrInstance, obj);

        if(obj.params.length == 0)
            throw new Error("ForProgramBlock: Not enought parameters")
        if(obj.blocks.length == 0)
            throw Error("ForProgramBlock: No blocks for for loop");
    }

    public async execute()
    {
        const lC = this.params[0].data() as number;
        this.pbrInstance.machine.logger.info(`ForBlock: Will loop ${lC} times.`);

        for(let i = 0; i < (lC); i++)
        {
            for(const instuction of this.blocks)
            {
                await instuction.execute();
            }
        }
    }
}

export class IfProgramBlock extends ProgramBlock
{
    operators: {[x: string]: (x: number, y: number) => boolean; } = {
        ">": (x: number, y: number) => x > y,
        "<": (x: number, y: number) => x < y,
        "==": (x: number, y: number) => x == y,
        "!=": (x: number, y: number) => x != y
    };

    constructor(pbrInstance: ProgramBlockRunner, obj: IProgramBlock)
    {
        super(pbrInstance, obj);
    }

    public async execute()
    {
        const lV = (this.params[0].data() as number);
        const rV = (this.params[2].data() as number);
        const c = (this.params[1].data() as string);

        this.pbrInstance.machine.logger.info(`IfBlock: Will compare ${lV} and ${rV} by ${c}`);
        
        if(this.operators[c](lV, rV))
        {
            if(this.blocks !== undefined)
                await this.blocks[0].execute();
        }
        else
        {
            if(this.blocks !== undefined)
                await this.blocks[1].execute();
        }
    }
}

export class IOWriteProgramBlock extends ProgramBlock
{
    constructor(pbrInstance: ProgramBlockRunner, obj: IProgramBlock)
    {
        super(pbrInstance, obj);
    }

    public async execute(): Promise<void>
    {

        const gN = this.params[0].data() as string;
        const gV = this.params[1].data() as number;

        this.pbrInstance.machine.logger.info(`IOAccessBlock: Will access ${gN} to write ${gV}`);

        await this.pbrInstance.ioExplorer?.explore(gN)?.write(this.pbrInstance.machine.ioController, gV);
    }
}

export class SleepProgramBlock extends ProgramBlock
{
    constructor(pbrInstance: ProgramBlockRunner, obj: IProgramBlock)
    {
        super(pbrInstance, obj)
    }

    public execute(): Promise<void>
    {
        const sT = this.params[0].data() as number;
        this.pbrInstance.machine.logger.info(`SleepBlock: Will sleep for ${sT * 1000} ms.`);

        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, sT * 1000);
        });
    }
}

export interface IProgramBlock
{
    name: string;
    params: IParameterBlock[];
    blocks: IProgramBlock[];
}

export function ProgramBlockRegistry(pbrInstance: ProgramBlockRunner, obj: IProgramBlock)
{
    switch(obj.name)
    {
        case "for": return new ForLoopProgramBlock(pbrInstance, obj);
        case "if": return new IfProgramBlock(pbrInstance, obj);
        case "sleep": return new SleepProgramBlock(pbrInstance, obj);
        case "io": return new IOWriteProgramBlock(pbrInstance, obj);
        default: {

            console.log("WARNING: Program block", obj.name, "is not defined properly");
            return new ProgramBlock(pbrInstance, obj);
        }
    }
}