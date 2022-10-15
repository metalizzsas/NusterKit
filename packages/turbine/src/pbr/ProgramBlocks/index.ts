import type { ParameterBlocks } from "../ParameterBlocks";
import { ProgramBlockRegistry } from "./ProgramBlockRegistry";
import type { ForLoopProgramBlock } from "./ForLoopProgramBlock";
import type { GroupProgramBlock } from "./GroupProgramBlock";
import type { IfProgramBlock } from "./IfProgramBlock";
import type { IOWriteProgramBlock } from "./IOWriteProgramBlock";
import type { MaintenanceProgramBlock } from "./MaintenanceProgramBlock";
import type { SleepProgramBlock } from "./SleepProgramBlock";
import type { SlotLoadProgramBlock } from "./SlotLoadProgramBlock";
import type { SlotUnloadProgramBlock } from "./SlotUnloadProgramBlock";
import type { StartTimerProgramBlock } from "./StartTimerProgramBlock";
import type { StopProgramBlock } from "./StopProgramBlock";
import type { StopTimerProgramBlock } from "./StopTimerProgramBlock";
import type { VariableProgramBlock } from "./VariableProgramBlock";
import type { WhileLoopProgramBlock } from "./WhileLoopProgramBlock";
import { ParameterBlockRegistry } from "../ParameterBlocks/ParameterBlockRegistry";
import type { PassiveProgramBlock } from "./PassiveProgramBlock";
import { LoggerInstance } from "../../app";
import type { IProgramBlock, ProgramBlockNames, IProgramBlocks } from "@metalizzsas/nuster-typings/build/spec/cycle/IProgramBlock";

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