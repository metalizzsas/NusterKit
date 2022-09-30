import { IProgramBlock, ProgramBlockNames } from "@metalizzsas/nuster-typings/build/spec/cycle/IProgramBlock";
import { IForLoopProgramBlock } from "@metalizzsas/nuster-typings/build/spec/cycle/programblocks/ProgramBlocks/IForLoopProgramBlock";
import { IGroupProgramBlock } from "@metalizzsas/nuster-typings/build/spec/cycle/programblocks/ProgramBlocks/IGroupProgramBlock";
import { IIfProgramBlock } from "@metalizzsas/nuster-typings/build/spec/cycle/programblocks/ProgramBlocks/IIfProgramBlock";
import { IIOProgramBlock } from "@metalizzsas/nuster-typings/build/spec/cycle/programblocks/ProgramBlocks/IIOProgramBlock";
import { IMaintenanceProgramBlock } from "@metalizzsas/nuster-typings/build/spec/cycle/programblocks/ProgramBlocks/IMaintenanceProgramBlock";
import { IPassiveProgramBlock } from "@metalizzsas/nuster-typings/build/spec/cycle/programblocks/ProgramBlocks/IPassiveProgramBlock";
import { ISleepProgramBlock } from "@metalizzsas/nuster-typings/build/spec/cycle/programblocks/ProgramBlocks/ISleepProgramBlock";
import { ISlotLoadProgramBlock } from "@metalizzsas/nuster-typings/build/spec/cycle/programblocks/ProgramBlocks/ISlotLoadProgramBlock";
import { ISlotUnloadProgramBlock } from "@metalizzsas/nuster-typings/build/spec/cycle/programblocks/ProgramBlocks/ISlotUnloadProgramBlock";
import { IStartTimerProgramBlock } from "@metalizzsas/nuster-typings/build/spec/cycle/programblocks/ProgramBlocks/IStartTimerProgramBlock";
import { IStopProgramBlock } from "@metalizzsas/nuster-typings/build/spec/cycle/programblocks/ProgramBlocks/IStopProgramBlock";
import { IStopTimerProgramBlock } from "@metalizzsas/nuster-typings/build/spec/cycle/programblocks/ProgramBlocks/IStopTimerProgramBlock";
import { IVariableProgramBlock } from "@metalizzsas/nuster-typings/build/spec/cycle/programblocks/ProgramBlocks/IVariableProgramBlock";
import { IWhileLoopProgramBlock } from "@metalizzsas/nuster-typings/build/spec/cycle/programblocks/ProgramBlocks/IWhileLoopProgramBlock";
import { ForLoopProgramBlock } from "./ForLoopProgramBlock";
import { GroupProgramBlock } from "./GroupProgramBlock";
import { IfProgramBlock } from "./IfProgramBlock";
import { ProgramBlocks } from "./index";
import { IOWriteProgramBlock } from "./IOWriteProgramBlock";
import { MaintenanceProgramBlock } from "./MaintenanceProgramBlock";
import { PassiveProgramBlock } from "./PassiveProgramBlock";
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
        case "passive": return new PassiveProgramBlock(obj as IPassiveProgramBlock);

        default: return new SleepProgramBlock({name: "sleep", params: [{name: "const", value: 1}]});
    }
}
