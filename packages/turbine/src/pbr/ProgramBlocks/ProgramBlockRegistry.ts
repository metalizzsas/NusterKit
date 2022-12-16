import type { ProgramBlockHydrated } from "@metalizzsas/nuster-typings/build/hydrated/cycle/blocks/ProgramBlockHydrated";
import type { AllProgramBlocks } from "@metalizzsas/nuster-typings/build/spec/cycle/IProgramBlocks";

import { CycleController } from "../../controllers/cycle/CycleController";

import { ForProgramBlock } from "./flow/ForProgramBlock";
import { IfProgramBlock } from "./flow/IfProgramBlock";
import { SleepProgramBlock } from "./flow/SleepProgramBlock";
import { StartTimerProgramBlock } from "./flow/StartTimerProgramBlock";
import { StopProgramBlock } from "./flow/StopProgramBlock";
import { StopTimerProgramBlock } from "./flow/StopTimerProgramBlock";
import { WhileProgramBlock } from "./flow/WhileProgramBlock";
import { SetVariableProgramBlock } from "./flow/WriteVariableProgramBlock";
import { AppendMaintenanceProgramBlock } from "./machine/AppendMaintenanceProgramBlock";
import { ContainerProductLoadProgramBlock } from "./machine/ContainerProductLoadProgramBlock";
import { ContainerProductUnloadProgramBlock } from "./machine/ContainerUnloadProgramBlock";
import { IOWriteProgramBlock } from "./machine/IOWriteProgramBlock";

export function ProgramBlockRegistry(obj: AllProgramBlocks): ProgramBlockHydrated {

    const pbrInstance = CycleController.getInstance().program;

    // Flow control blocks

    if(ForProgramBlock.isForPgB(obj)) return new ForProgramBlock(obj, pbrInstance);
    if(IfProgramBlock.isIfPgB(obj)) return new IfProgramBlock(obj);
    if(WhileProgramBlock.isWhilePgB(obj)) return new WhileProgramBlock(obj, pbrInstance);
    if(SleepProgramBlock.isSleepPgB(obj)) return new SleepProgramBlock(obj, pbrInstance);

    if(StartTimerProgramBlock.isStartTimerPgB(obj)) return new StartTimerProgramBlock(obj, pbrInstance);
    if(StopTimerProgramBlock.isStopTimerPgB(obj)) return new StopTimerProgramBlock(obj, pbrInstance);

    if(StopProgramBlock.isStopPgB(obj)) return new StopProgramBlock(obj, pbrInstance);
    if(SetVariableProgramBlock.isSetVariablePgB(obj)) return new SetVariableProgramBlock(obj, pbrInstance);

    // Machine blocks

    if(IOWriteProgramBlock.isIOWritePgB(obj)) return new IOWriteProgramBlock(obj);
    if(AppendMaintenanceProgramBlock.isAppendMaintenancePgB(obj)) return new AppendMaintenanceProgramBlock(obj);
    if(ContainerProductUnloadProgramBlock.isContainerProductUnloadPgB(obj)) return new ContainerProductUnloadProgramBlock(obj);
    if(ContainerProductLoadProgramBlock.isContainterProductLoadPgB(obj)) return new ContainerProductLoadProgramBlock(obj);

    throw new Error("Program Block is not assignable");
}