import { EProgramBlockName, IProgramBlock } from "../interfaces/IProgramBlock";
import { PBRMode } from "../interfaces/IProgramBlockRunner";
import { Block } from "./Block";
import { ParameterBlock, ParameterBlockRegistry } from "./ParameterBlocks";
import { ProgramBlockRunner } from "./ProgramBlockRunner";

export class ProgramBlock extends Block implements IProgramBlock
{
    name: EProgramBlockName;

    params: ParameterBlock[] = [];
    blocks: ProgramBlock[] = [];

    executed = false;

    constructor(pbrInstance: ProgramBlockRunner, obj: IProgramBlock)
    {
        super(pbrInstance);

        this.name = obj.name

        for(const p of obj.params ?? [])
        {
            this.params.push(ParameterBlockRegistry(this.pbrInstance, p));
        }

        for(const b of obj.blocks ?? [])
        {
            this.blocks.push(ProgramBlockRegistry(this.pbrInstance, b));              
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

        if(this.params.length == 0)
            throw new Error("ForProgramBlock: Not enought parameters")
        if(this.blocks.length == 0)
            throw Error("ForProgramBlock: No blocks for for loop");

        this.currentIteration = obj.currentIteration ?? 0;
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

        this.currentIteration = 0; // reset current iteration if we dont, multiple steps execute for loops only at the begining
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

        if(this.params.length < 3)
            throw new Error("WhileProgramBlock: Not enought parameters");
        if(this.blocks.length == 0)
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
            if(this.blocks !== undefined && this.blocks[0])
                await this.blocks[0].execute();
        }
        else
        {
            if(this.blocks !== undefined && this.blocks[1])
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

        for(let i = 0; i < ((sT * 1000) / 10); i++)
        {
            if(this.pbrInstance.status.mode != PBRMode.ENDED)
                await new Promise(resolve => {
                    setTimeout(resolve, 10);
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
        if(process.env.NODE_ENV != "production")
        {
            this.pbrInstance.machine.logger.info("StopBlock: Debug mode will not stop the machine.");
            return;
        }
            
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

export class StartTimerProgramBlock extends ProgramBlock
{
    constructor(pbrInstance: ProgramBlockRunner, obj: IProgramBlock)
    {
        super(pbrInstance, obj);
    }

    public async execute(): Promise<void> {
        const tN = this.params[0].data() as string;
        const tI = this.params[1].data() as number;

        const timer = setInterval(async () => {
            for(const b of this.blocks)
            {
                await b.execute();
            }
        }, tI * 1000);
        this.pbrInstance.machine.logger.info("StartTimerBlock: Will start timer with name: " + tN + " and interval: " + tI * 1000 + " ms.");
        this.pbrInstance.timers.push({name: tN, timer: timer, blocks: this.blocks, enabled: true});
    }
}

export class StopTimerProgramBlock extends ProgramBlock
{
    constructor(pbrInstance: ProgramBlockRunner, obj: IProgramBlock)
    {
        super(pbrInstance, obj);
    }

    public async execute(): Promise<void> {
        const tN = this.params[0].data() as string;

        const timer = this.pbrInstance.timers.find((t) => t.name == tN);

        if(timer && timer.enabled)
        {
            clearInterval(timer.timer);
            timer.enabled = false;
            this.pbrInstance.machine.logger.info("StopTimerBlock: Will stop timer with name: " + tN);
        }
    }
}

export class GroupProgramBlock extends ProgramBlock
{
    constructor(pbrInstance: ProgramBlockRunner, obj: IProgramBlock)
    {
        super(pbrInstance, obj);
    }

    public async execute(): Promise<void> {

        this.pbrInstance.machine.logger.info("GroupsBlock: Will execute " + this.blocks.length + " blocks.");
        for(const b of this.blocks)
        {
            await b.execute();
        }
    }
}

export function ProgramBlockRegistry(pbrInstance: ProgramBlockRunner, obj: IProgramBlock)
{
    switch(obj.name)
    {
        case EProgramBlockName.FOR: return new ForLoopProgramBlock(pbrInstance, obj);
        case EProgramBlockName.WHILE: return new WhileLoopProgramBlock(pbrInstance, obj);
        case EProgramBlockName.IF: return new IfProgramBlock(pbrInstance, obj);
        case EProgramBlockName.SLEEP: return new SleepProgramBlock(pbrInstance, obj);
        case EProgramBlockName.IO: return new IOWriteProgramBlock(pbrInstance, obj);
        case EProgramBlockName.MAINTENANCE: return new MaintenanceProgramBlock(pbrInstance, obj);
        case EProgramBlockName.STOP: return new StopProgramBlock(pbrInstance, obj);
        case EProgramBlockName.VARIABLE: return new VariableProgramBlock(pbrInstance, obj);
        case EProgramBlockName.STARTTIMER: return new StartTimerProgramBlock(pbrInstance, obj);
        case EProgramBlockName.STOPTIMER: return new StopTimerProgramBlock(pbrInstance, obj);
        case EProgramBlockName.GROUP: return new GroupProgramBlock(pbrInstance, obj);

        default: {
            pbrInstance.machine.logger.warn("Program block " + obj.name + " is not defined properly.");
            pbrInstance.machine.logger.warn(obj);
            return new ProgramBlock(pbrInstance, obj);
        }
    }
}