import { ParameterBlocks } from "../ParameterBlocks";
import { ProgramBlockRegistry } from "./ProgramBlockRegistry";
import { ForLoopProgramBlock } from "./ForLoopProgramBlock";
import { GroupProgramBlock } from "./GroupProgramBlock";
import { IfProgramBlock } from "./IfProgramBlock";
import { IOWriteProgramBlock } from "./IOWriteProgramBlock";
import { MaintenanceProgramBlock } from "./MaintenanceProgramBlock";
import { SleepProgramBlock } from "./SleepProgramBlock";
import { SlotLoadProgramBlock } from "./SlotLoadProgramBlock";
import { SlotUnloadProgramBlock } from "./SlotUnloadProgramBlock";
import { StartTimerProgramBlock } from "./StartTimerProgramBlock";
import { StopProgramBlock } from "./StopProgramBlock";
import { StopTimerProgramBlock } from "./StopTimerProgramBlock";
import { VariableProgramBlock } from "./VariableProgramBlock";
import { WhileLoopProgramBlock } from "./WhileLoopProgramBlock";
import { ParameterBlockRegistry } from "../ParameterBlocks/ParameterBlockRegistry";
import { PassiveProgramBlock } from "./PassiveProgramBlock";
import { LoggerInstance } from "../../app";
import { IProgramBlock, ProgramBlockNames, IProgramBlocks } from "@metalizz/nuster-typings/src/spec/cycle/IProgramBlock";

export class ProgramBlock implements IProgramBlock
{
    name: ProgramBlockNames = "default";

    params?: ParameterBlocks[];
    blocks?: ProgramBlocks[];

    executed = false;

    constructor(obj: IProgramBlock)
    {
        this.executed = obj.executed || false;
    }

    fillProgramBlocks(obj: IProgramBlock)
    {
        if(this.blocks === undefined)
            this.blocks = [];
        
        for(const b of obj.blocks ?? [])
        {
            this.blocks.push(ProgramBlockRegistry(b));              
        }
    }

    fillParameterBlocks(obj: IProgramBlock)
    {
        if(this.params === undefined)
            this.params = [];

        for(const p of obj.params ?? [])
        {
            this.params.push(ParameterBlockRegistry(p));
        }
    }

    public async execute(): Promise<void> {
        LoggerInstance.info(`This Programblock does nothing`);

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

export type ProgramBlocks = (
    ForLoopProgramBlock | 
    IfProgramBlock | 
    WhileLoopProgramBlock | 
    SleepProgramBlock | 
    IOWriteProgramBlock | 
    MaintenanceProgramBlock | 
    StopProgramBlock | 
    VariableProgramBlock | 
    StartTimerProgramBlock | 
    StopTimerProgramBlock | 
    GroupProgramBlock | 
    SlotLoadProgramBlock | 
    SlotUnloadProgramBlock | 
    PassiveProgramBlock
) & IProgramBlocks;