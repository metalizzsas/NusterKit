import type { AllProgramBlocks } from "../../types/spec/cycle/program";
import type { PBRContext } from "../../services/PBRContext";

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
import { SetRegulationStateProgramBlock } from "./machine/SetRegulationStateProgramBlock";
import type { ProgramBlock } from "./ProgramBlock";

export function ProgramBlockRegistry(obj: AllProgramBlocks, ctx: PBRContext): ProgramBlock {

    // Flow control blocks

    if(ForProgramBlock.isForPgB(obj)) return new ForProgramBlock(obj, ctx);
    if(IfProgramBlock.isIfPgB(obj)) return new IfProgramBlock(obj, ctx);
    if(WhileProgramBlock.isWhilePgB(obj)) return new WhileProgramBlock(obj, ctx);
    if(SleepProgramBlock.isSleepPgB(obj)) return new SleepProgramBlock(obj, ctx);

    if(StartTimerProgramBlock.isStartTimerPgB(obj)) return new StartTimerProgramBlock(obj, ctx);
    if(StopTimerProgramBlock.isStopTimerPgB(obj)) return new StopTimerProgramBlock(obj, ctx);

    if(StopProgramBlock.isStopPgB(obj)) return new StopProgramBlock(obj, ctx);
    if(SetVariableProgramBlock.isSetVariablePgB(obj)) return new SetVariableProgramBlock(obj, ctx);

    // Machine blocks

    if(IOWriteProgramBlock.isIOWritePgB(obj)) return new IOWriteProgramBlock(obj, ctx);
    if(AppendMaintenanceProgramBlock.isAppendMaintenancePgB(obj)) return new AppendMaintenanceProgramBlock(obj, ctx);
    if(ContainerProductUnloadProgramBlock.isContainerProductUnloadPgB(obj)) return new ContainerProductUnloadProgramBlock(obj, ctx);
    if(ContainerProductLoadProgramBlock.isContainterProductLoadPgB(obj)) return new ContainerProductLoadProgramBlock(obj, ctx);
    if(SetRegulationStateProgramBlock.isSetRegulationStatePB(obj)) return new SetRegulationStateProgramBlock(obj, ctx);

    throw new Error("Program Block is not assignable");
}