import type { PBRContext } from "../../services/pbr-context";
import type { AllProgramBlocks } from "../../types/spec/cycle/program";
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

	if (ForProgramBlock.is_for_pg_b(obj)) return new ForProgramBlock(obj, ctx);
	if (IfProgramBlock.is_if_pg_b(obj)) return new IfProgramBlock(obj, ctx);
	if (WhileProgramBlock.is_while_pg_b(obj)) return new WhileProgramBlock(obj, ctx);
	if (SleepProgramBlock.is_sleep_pg_b(obj)) return new SleepProgramBlock(obj, ctx);

	if (StartTimerProgramBlock.is_start_timer_pg_b(obj)) return new StartTimerProgramBlock(obj, ctx);
	if (StopTimerProgramBlock.is_stop_timer_pg_b(obj)) return new StopTimerProgramBlock(obj, ctx);

	if (StopProgramBlock.is_stop_pg_b(obj)) return new StopProgramBlock(obj, ctx);
	if (SetVariableProgramBlock.is_set_variable_pg_b(obj)) return new SetVariableProgramBlock(obj, ctx);

	// Machine blocks

	if (IOWriteProgramBlock.is_io_write_pg_b(obj)) return new IOWriteProgramBlock(obj, ctx);
	if (AppendMaintenanceProgramBlock.is_append_maintenance_pg_b(obj)) return new AppendMaintenanceProgramBlock(obj, ctx);
	if (ContainerProductUnloadProgramBlock.is_container_product_unload_pg_b(obj)) return new ContainerProductUnloadProgramBlock(obj, ctx);
	if (ContainerProductLoadProgramBlock.is_containter_product_load_pg_b(obj)) return new ContainerProductLoadProgramBlock(obj, ctx);
	if (SetRegulationStateProgramBlock.is_set_regulation_state_pb(obj)) return new SetRegulationStateProgramBlock(obj, ctx);

	throw new Error("Program Block is not assignable");
}
