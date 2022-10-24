import { IParameterBlocks } from "./IParameterBlock";
import { IForLoopProgramBlock } from "./programblocks/ProgramBlocks/IForLoopProgramBlock";
import { IGroupProgramBlock } from "./programblocks/ProgramBlocks/IGroupProgramBlock";
import { IIfProgramBlock } from "./programblocks/ProgramBlocks/IIfProgramBlock";
import { IIOProgramBlock } from "./programblocks/ProgramBlocks/IIOProgramBlock";
import { IMaintenanceProgramBlock } from "./programblocks/ProgramBlocks/IMaintenanceProgramBlock";
import { IRegulationProgramBlock } from "./programblocks/ProgramBlocks/IRegulationProgramBlock";
import { ISleepProgramBlock } from "./programblocks/ProgramBlocks/ISleepProgramBlock";
import { ISlotLoadProgramBlock } from "./programblocks/ProgramBlocks/ISlotLoadProgramBlock";
import { ISlotUnloadProgramBlock } from "./programblocks/ProgramBlocks/ISlotUnloadProgramBlock";
import { IStartTimerProgramBlock } from "./programblocks/ProgramBlocks/IStartTimerProgramBlock";
import { IStopProgramBlock } from "./programblocks/ProgramBlocks/IStopProgramBlock";
import { IStopTimerProgramBlock } from "./programblocks/ProgramBlocks/IStopTimerProgramBlock";
import { IVariableProgramBlock } from "./programblocks/ProgramBlocks/IVariableProgramBlock";
import { IWhileLoopProgramBlock } from "./programblocks/ProgramBlocks/IWhileLoopProgramBlock";

export type ProgramBlockNames = "default" | "for" | "while" | "if" | "sleep" | "io" | "maintenance" | "stop" | "variable" | "startTimer" | "stopTimer" | "group" | "slotLoad" | "slotUnload" | "regulation";

export interface IProgramBlock
{
    name: ProgramBlockNames;
    params?: IParameterBlocks[];
    blocks?: IProgramBlocks[];

    executed?: boolean;
}

export type IProgramBlocks = (
    IForLoopProgramBlock | 
    IWhileLoopProgramBlock | 
    IGroupProgramBlock | 
    IStopProgramBlock | 
    IStopTimerProgramBlock | 
    IStartTimerProgramBlock | 
    IIfProgramBlock | 
    IVariableProgramBlock | 
    IIOProgramBlock | 
    IMaintenanceProgramBlock | 
    ISlotLoadProgramBlock | 
    ISlotUnloadProgramBlock | 
    ISleepProgramBlock | 
    IRegulationProgramBlock
);