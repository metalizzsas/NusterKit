import { Block } from "./Block";
import { ParameterBlock, IParameterBlock, ParameterBlockRegistry } from "./ParameterBlocks";
import { PBRMode, ProgramBlockRunner } from "./ProgramBlockRunner";

export class ProgramBlock extends Block implements IProgramBlock
{
    name: string;

    params: ParameterBlock[] = [];
    blocks: ProgramBlock[] = [];

    executed = false;

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

        this.executed = obj.executed || false;
    }

    public async execute(): Promise<unknown> {
        this.pbrInstance.machine.logger.info(`This Programblock does nothing`);

        this.executed = true;
        return;
    }

    public toJSON()
    {
        return {
            name: this.name,

            params: this.params,
            blocks: this.blocks,

            executed: this.executed
        };
    }
}

export interface IForLoopProgramBlock extends IProgramBlock {
    currentIteration?: number;
}

export class ForLoopProgramBlock extends ProgramBlock implements IForLoopProgramBlock
{
    public currentIteration: number;

    constructor(pbrInstance: ProgramBlockRunner, obj: IForLoopProgramBlock)
    {
        super(pbrInstance, obj);

        if(obj.params.length == 0)
            throw new Error("ForProgramBlock: Not enought parameters")
        if(obj.blocks.length == 0)
            throw Error("ForProgramBlock: No blocks for for loop");

        this.currentIteration = obj.currentIteration || 0;
    }

    public async execute()
    {
        const lC = this.params[0].data() as number;
        this.pbrInstance.machine.logger.info(`ForBlock: Will loop ${lC} times. Starting from: ${this.currentIteration}`);

        for(; this.currentIteration < (lC); this.currentIteration++)
        {
            if(this.pbrInstance.status.mode == PBRMode.ENDED)
            {
                this.executed = (this.currentIteration + 1 == (lC));
                return;
            }

            for(const instuction of this.blocks)
            {
                await instuction.execute();
            }
        }
        this.executed = true;
    }
}

export class WhileLoopProgramBlock extends ProgramBlock
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

        if(obj.params.length < 3)
            throw new Error("WhileProgramBlock: Not enought parameters");
        if(obj.blocks.length == 0)
            throw Error("WhileProgramBlock: No blocks for while loop");
    }

    public async execute(): Promise<void>
    {
        while(this.operators[this.params[1].data() as string](this.params[0].data() as number, this.params[2].data() as number))
        {
            if(this.pbrInstance.status.mode == PBRMode.ENDED)
            {
                this.executed = true;
                return;
            }
            
            for(const b of this.blocks)
            {
                await b.execute();
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
        this.executed = true;
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
        this.executed = true;

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
            if(this.pbrInstance.status.mode != PBRMode.ENDED)
                await new Promise(resolve => {
                    setTimeout(resolve, (sT * 1000) / 100);
                });
            else
                return;
        }
        this.executed = true;
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
        this.executed = true;

    }
}

export class StopProgramBlock extends ProgramBlock
{
    constructor(pbrInstance: ProgramBlockRunner, obj: IProgramBlock)
    {
        super(pbrInstance, obj)
    }

    public async execute(): Promise<void>
    {
        this.pbrInstance.end(this.params[0].data() as string);
        this.executed = true;
    }
}

export class VariableProgramBlock extends ProgramBlock
{
    constructor(pbrInstance: ProgramBlockRunner, obj: IProgramBlock)
    {
        super(pbrInstance, obj)
    }

    public async execute(): Promise<void>
    {
        const vN = this.params[0].data() as string;
        const vV = this.params[1].data() as number;

        const referenceIndex = this.pbrInstance.variables.findIndex((v) => v.name == vN)
        
        if(referenceIndex != -1)
        {
            this.pbrInstance.variables[referenceIndex].value = vV;
        }
        else
        {
            this.pbrInstance.variables.push({name: vN, value: vV});
        }
    }
}

export interface IProgramBlock
{
    name: string;
    params: IParameterBlock[];
    blocks: IProgramBlock[];

    executed?: boolean;
}

export function ProgramBlockRegistry(pbrInstance: ProgramBlockRunner, obj: IProgramBlock)
{
    switch(obj.name)
    {
        case "for": return new ForLoopProgramBlock(pbrInstance, obj);
        case "while": return new WhileLoopProgramBlock(pbrInstance, obj);
        case "if": return new IfProgramBlock(pbrInstance, obj);
        case "sleep": return new SleepProgramBlock(pbrInstance, obj);
        case "io": return new IOWriteProgramBlock(pbrInstance, obj);
        case "maintenance": return new MaintenanceProgramBlock(pbrInstance, obj);
        case "stop": return new StopProgramBlock(pbrInstance, obj);
        case "variable": return new VariableProgramBlock(pbrInstance, obj);

        default: {
            pbrInstance.machine.logger.warn("Program block", obj.name, "is not defined properly.");
            return new ProgramBlock(pbrInstance, obj);
        }
    }
}