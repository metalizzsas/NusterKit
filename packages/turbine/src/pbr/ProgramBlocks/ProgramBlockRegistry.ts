import { IProgramBlock, ProgramBlockNames } from "../../interfaces/IProgramBlock";
import { ForLoopProgramBlock } from "./ForLoopProgramBlock";
import { IForLoopProgramBlock } from "../../interfaces/programblocks/ProgramBlocks/IForLoopProgramBlock";
import { GroupProgramBlock } from "./GroupProgramBlock";
import { IGroupProgramBlock } from "../../interfaces/programblocks/ProgramBlocks/IGroupProgramBlock";
import { IfProgramBlock } from "./IfProgramBlock";
import { IIfProgramBlock } from "../../interfaces/programblocks/ProgramBlocks/IIfProgramBlock";
import { IOWriteProgramBlock } from "./IOWriteProgramBlock";
import { IIOProgramBlock } from "../../interfaces/programblocks/ProgramBlocks/IIOProgramBlock";
import { MaintenanceProgramBlock } from "./MaintenanceProgramBlock";
import { IMaintenanceProgramBlock } from "../../interfaces/programblocks/ProgramBlocks/IMaintenanceProgramBlock";
import { SleepProgramBlock } from "./SleepProgramBlock";
import { ISleepProgramBlock } from "../../interfaces/programblocks/ProgramBlocks/ISleepProgramBlock";
import { SlotLoadProgramBlock } from "./SlotLoadProgramBlock";
import { ISlotLoadProgramBlock } from "../../interfaces/programblocks/ProgramBlocks/ISlotLoadProgramBlock";
import { SlotUnloadProgramBlock } from "./SlotUnloadProgramBlock";
import { ISlotUnloadProgramBlock } from "../../interfaces/programblocks/ProgramBlocks/ISlotUnloadProgramBlock";
import { StartTimerProgramBlock } from "./StartTimerProgramBlock";
import { IStartTimerProgramBlock } from "../../interfaces/programblocks/ProgramBlocks/IStartTimerProgramBlock";
import { StopProgramBlock } from "./StopProgramBlock";
import { IStopProgramBlock } from "../../interfaces/programblocks/ProgramBlocks/IStopProgramBlock";
import { StopTimerProgramBlock } from "./StopTimerProgramBlock";
import { IStopTimerProgramBlock } from "../../interfaces/programblocks/ProgramBlocks/IStopTimerProgramBlock";
import { VariableProgramBlock } from "./VariableProgramBlock";
import { IVariableProgramBlock } from "../../interfaces/programblocks/ProgramBlocks/IVariableProgramBlock";
import { WhileLoopProgramBlock } from "./WhileLoopProgramBlock";
import { IWhileLoopProgramBlock } from "../../interfaces/programblocks/ProgramBlocks/IWhileLoopProgramBlock";
import { ProgramBlocks } from "./index";
import { PassiveProgramBlock } from "./PassiveProgramBlock";
import { IPassiveProgramBlock } from "../../interfaces/programblocks/ProgramBlocks/IPassiveProgramBlock";

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
