import type { IProgramBlock, ProgramBlockNames } from "@metalizzsas/nuster-typings/build/spec/cycle/IProgramBlock";
import type { IForLoopProgramBlock } from "@metalizzsas/nuster-typings/build/spec/cycle/programblocks/ProgramBlocks/IForLoopProgramBlock";
import type { IGroupProgramBlock } from "@metalizzsas/nuster-typings/build/spec/cycle/programblocks/ProgramBlocks/IGroupProgramBlock";
import type { IIfProgramBlock } from "@metalizzsas/nuster-typings/build/spec/cycle/programblocks/ProgramBlocks/IIfProgramBlock";
import type { IIOProgramBlock } from "@metalizzsas/nuster-typings/build/spec/cycle/programblocks/ProgramBlocks/IIOProgramBlock";
import type { IMaintenanceProgramBlock } from "@metalizzsas/nuster-typings/build/spec/cycle/programblocks/ProgramBlocks/IMaintenanceProgramBlock";
import type { IRegulationProgramBlock } from "@metalizzsas/nuster-typings/build/spec/cycle/programblocks/ProgramBlocks/IRegulationProgramBlock";
import type { ISleepProgramBlock } from "@metalizzsas/nuster-typings/build/spec/cycle/programblocks/ProgramBlocks/ISleepProgramBlock";
import type { ISlotLoadProgramBlock } from "@metalizzsas/nuster-typings/build/spec/cycle/programblocks/ProgramBlocks/ISlotLoadProgramBlock";
import type { ISlotUnloadProgramBlock } from "@metalizzsas/nuster-typings/build/spec/cycle/programblocks/ProgramBlocks/ISlotUnloadProgramBlock";
import type { IStartTimerProgramBlock } from "@metalizzsas/nuster-typings/build/spec/cycle/programblocks/ProgramBlocks/IStartTimerProgramBlock";
import type { IStopProgramBlock } from "@metalizzsas/nuster-typings/build/spec/cycle/programblocks/ProgramBlocks/IStopProgramBlock";
import type { IStopTimerProgramBlock } from "@metalizzsas/nuster-typings/build/spec/cycle/programblocks/ProgramBlocks/IStopTimerProgramBlock";
import type { IVariableProgramBlock } from "@metalizzsas/nuster-typings/build/spec/cycle/programblocks/ProgramBlocks/IVariableProgramBlock";
import type { IWhileLoopProgramBlock } from "@metalizzsas/nuster-typings/build/spec/cycle/programblocks/ProgramBlocks/IWhileLoopProgramBlock";
import { ForLoopProgramBlock } from "./ForLoopProgramBlock";
import { GroupProgramBlock } from "./GroupProgramBlock";
import { IfProgramBlock } from "./IfProgramBlock";
import type { ProgramBlocks } from "./index";
import { IOWriteProgramBlock } from "./IOWriteProgramBlock";
import { MaintenanceProgramBlock } from "./MaintenanceProgramBlock";
import { RegulationProgramBlock } from "./RegulationProgramBlock";
import { SleepProgramBlock } from "./SleepProgramBlock";
import { SlotLoadProgramBlock } from "./SlotLoadProgramBlock";
import { SlotUnloadProgramBlock } from "./SlotUnloadProgramBlock";
import { StartTimerProgramBlock } from "./StartTimerProgramBlock";
import { StopProgramBlock } from "./StopProgramBlock";
import { StopTimerProgramBlock } from "./StopTimerProgramBlock";
import { VariableProgramBlock } from "./VariableProgramBlock";
import { WhileLoopProgramBlock } from "./WhileLoopProgramBlock";

export function ProgramBlockRegistry(obj: IProgramBlock): ProgramBlocks {
    switch (obj.name as ProgramBlockNames)
    {
        case "for": return new ForLoopProgramBlock(obj as IForLoopProgramBlock);
        case "group": return new GroupProgramBlock(obj as IGroupProgramBlock);
        case "if": return new IfProgramBlock(obj as IIfProgramBlock);
        case "io": return new IOWriteProgramBlock(obj as IIOProgramBlock);
        case "maintenance": return new MaintenanceProgramBlock(obj as IMaintenanceProgramBlock);
        case "sleep": return new SleepProgramBlock(obj as ISleepProgramBlock);
        case "slotLoad": return new SlotLoadProgramBlock(obj as ISlotLoadProgramBlock);
        case "slotUnload": return new SlotUnloadProgramBlock(obj as ISlotUnloadProgramBlock);
        case "startTimer": return new StartTimerProgramBlock(obj as IStartTimerProgramBlock);
        case "stop": return new StopProgramBlock(obj as IStopProgramBlock);
        case "stopTimer": return new StopTimerProgramBlock(obj as IStopTimerProgramBlock);
        case "variable": return new VariableProgramBlock(obj as IVariableProgramBlock);
        case "while": return new WhileLoopProgramBlock(obj as IWhileLoopProgramBlock);
        case "regulation": return new RegulationProgramBlock(obj as IRegulationProgramBlock);

        default: return new SleepProgramBlock({name: "sleep", params: [{name: "const", value: 1}]});
    }
}
