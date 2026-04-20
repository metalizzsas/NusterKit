import type { PBRMode, PBRTimer } from "$types/hydrated/cycle/program-block-runner-hydrated";
import type { IOGateJSON } from "$types/hydrated/io";
import type { ProfileHydrated } from "$types/hydrated/profiles";
import type { ServiceRegistry } from "./interfaces";
import type { ScopedEmitter } from "./scoped-emitter";

/**
 * Events emitted by the per-PBR scoped emitter.
 * Replaces the global TurbineEventLoop for PBR-scoped fan-out.
 */
export type PBREmitterEvents = {
	"status.update": (status: PBRMode) => void;
	pause: () => void;
	resume: () => void;
	stop: (reason: string) => void;
	"variable.write": (options: { name: string; value: number }) => void;
	[key: `step.${string}.stop`]: (reason?: string) => void;
	// Index signature needed for ScopedEmitter generic constraint
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	[key: string]: (...args: any[]) => void;
};

export type PBREmitter = ScopedEmitter<PBREmitterEvents>;

/**
 * PBRContext — injected into every ProgramBlock, ParameterBlock, and PBRRunCondition.
 *
 * Provides direct method access to all services (IOBus, ContainerBus, etc.)
 * plus PBR-scoped operations (timers, variables, profile) and a scoped emitter
 * for fan-out events (pause, resume, stop, status updates).
 *
 * During migration, this parameter is optional — blocks that haven't been
 * converted yet ignore it and use TurbineEventLoop as before.
 */
export interface PBRContext extends ServiceRegistry {
	/** Per-PBR scoped emitter for fan-out events */
	pbr_emitter: PBREmitter;

	/** Read a PBR variable by name. Returns 0 if not found. */
	read_variable(name: string): number;

	/** Write a PBR variable. Creates it if it doesn't exist. */
	write_variable(name: string, value: number): void;

	/** Read the profile assigned to this PBR run. */
	read_profile(): ProfileHydrated | undefined;

	/** Check if a timer with the given name exists. */
	timer_exists(name: string): boolean;

	/** Start a named timer. */
	timer_start(timer: PBRTimer & { timer?: ReturnType<typeof setInterval> }): void;

	/** Stop a named timer. Returns true if found and stopped. */
	timer_stop(name: string): boolean;

	/** Set whether the PBR can be paused right now. */
	set_pausable(pausable: boolean): void;

	/** Trigger a PBR stop with the given reason. */
	stop(reason: string): void;
}
