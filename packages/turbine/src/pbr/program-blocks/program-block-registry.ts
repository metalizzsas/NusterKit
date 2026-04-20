import type { AllProgramBlocks } from "../../types/spec/cycle/program";
import type { PBRContext } from "../../services/pbr-context";

import { ForProgramBlock } from "./flow/for-program-block";
import { IfProgramBlock } from "./flow/if-program-block";
import { SleepProgramBlock } from "./flow/sleep-program-block";
import { StartTimerProgramBlock } from "./flow/start-timer-program-block";
import { StopProgramBlock } from "./flow/stop-program-block";
import { StopTimerProgramBlock } from "./flow/stop-timer-program-block";
import { WhileProgramBlock } from "./flow/while-program-block";
import { SetVariableProgramBlock } from "./flow/write-variable-program-block";
import { AppendMaintenanceProgramBlock } from "./machine/append-maintenance-program-block";
import { ContainerProductLoadProgramBlock } from "./machine/container-product-load-program-block";
import { ContainerProductUnloadProgramBlock } from "./machine/container-unload-program-block";
import { IOWriteProgramBlock } from "./machine/io-write-program-block";
import { SetRegulationStateProgramBlock } from "./machine/set-regulation-state-program-block";
import type { ProgramBlock } from "./program-block";

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