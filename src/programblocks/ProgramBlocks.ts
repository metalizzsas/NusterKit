import { CycleMode } from "../controllers/cycle/Cycle";
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

    public async execute(): Promise<unknown> {
        this.pbrInstance.machine.logger.info(`This Programblock does nothing`);

        return;
    }

    public toJSON()
    {
        return {
            name: this.name,

            params: this.params,
            blocks: this.blocks
        };
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
            if(this.pbrInstance.status.mode == CycleMode.ENDED)
                return;
            
            for(const instuction of this.blocks)
            {
                await instuction.execute();
            }
        }
    }
}

export class IfProgramBlock extends ProgramBlock
{
    private operators: {[x: string]: (x: number, y: number) => boolean; } = {
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

    public async execute(): Promise<void>
    {
        const sT = this.params[0].data() as number;
        this.pbrInstance.machine.logger.info(`SleepBlock: Will sleep for ${sT * 1000} ms.`);

        for(let i = 0; i < 100; i++)
        {
            if(this.pbrInstance.status.mode != CycleMode.ENDED)
                await new Promise(resolve => {
                    setTimeout(resolve, (sT * 1000) / 100);
                });
            else
                return;
        }
    }
}

export class MaintenanceProgramBlock extends ProgramBlock
{
    constructor(pbrInstance: ProgramBlockRunner, obj: IProgramBlock)
    {
        super(pbrInstance, obj)
    }

    public async execute(): Promise<void>
    {
        const mN = this.params[0].data() as string;
        const mV = this.params[1].data() as number;

        const m = this.pbrInstance.machine.maintenanceController.tasks.find((m) => m.name == mN);
       
        if(m)
        {
            m.append(mV);
        }
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
        case "maintenance": return new MaintenanceProgramBlock(pbrInstance, obj);

        default: {
            console.log("WARNING: Program block", obj.name, "is not defined properly");
            return new ProgramBlock(pbrInstance, obj);
        }
    }
}