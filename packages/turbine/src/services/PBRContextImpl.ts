import type { PBRContext, PBREmitter, PBREmitterEvents } from "./PBRContext";
import type { ServiceRegistry } from "./interfaces";
import type { IOBus, ContainerBus, MaintenanceBus, ProfileService, MachineService, Logger } from "./interfaces";
import type { ProfileHydrated } from "$types/hydrated/profiles";
import type { PBRTimer } from "$types/hydrated/cycle/ProgramBlockRunnerHydrated";
import { ScopedEmitter } from "./ScopedEmitter";

/**
 * Concrete PBRContext implementation.
 *
 * Created per PBR run. Holds references to all service adapters plus
 * PBR-scoped state (variables, timers, profile). The pbrEmitter is
 * disposed when the PBR ends, automatically cleaning up all fan-out listeners.
 *
 * The PBR instance calls `bindPBR()` after construction to wire up
 * the PBR-specific methods (readVariable, timerExists, etc.).
 */
export class PBRContextImpl implements PBRContext {
	// Service adapters (from ServiceRegistry)
	io: IOBus;
	containers: ContainerBus;
	maintenance: MaintenanceBus;
	profiles: ProfileService;
	machine: MachineService;
	logger: Logger;

	// Per-PBR scoped emitter
	pbrEmitter: PBREmitter;

	// PBR state — bound lazily via bindPBR()
	private _variables!: Array<{ name: string; value: number }>;
	private _timers!: (PBRTimer & { timer?: ReturnType<typeof setInterval> })[];
	private _profile?: ProfileHydrated;
	private _setPausable!: (pausable: boolean) => void;
	private _stop!: (reason: string) => void;

	constructor(services: ServiceRegistry) {
		this.io = services.io;
		this.containers = services.containers;
		this.maintenance = services.maintenance;
		this.profiles = services.profiles;
		this.machine = services.machine;
		this.logger = services.logger;

		this.pbrEmitter = new ScopedEmitter<PBREmitterEvents>();
	}

	/**
	 * Bind PBR-specific state after the PBR instance is constructed.
	 * This avoids circular dependency: PBRContext is created first,
	 * then PBR calls bindPBR() to wire up its internal state.
	 */
	bindPBR(options: {
		variables: Array<{ name: string; value: number }>;
		timers: (PBRTimer & { timer?: ReturnType<typeof setInterval> })[];
		profile?: ProfileHydrated;
		setPausable: (pausable: boolean) => void;
		stop: (reason: string) => void;
	}): void {
		this._variables = options.variables;
		this._timers = options.timers;
		this._profile = options.profile;
		this._setPausable = options.setPausable;
		this._stop = options.stop;
	}

	readVariable(name: string): number {
		return this._variables.find(v => v.name === name)?.value ?? 0;
	}

	writeVariable(name: string, value: number): void {
		const existing = this._variables.find(v => v.name === name);
		if (existing) {
			existing.value = value;
		} else {
			this._variables.push({ name, value });
		}
		this.pbrEmitter.emit("variable.write", { name, value });
	}

	readProfile(): ProfileHydrated | undefined {
		return this._profile;
	}

	timerExists(name: string): boolean {
		return this._timers.some(t => t.name === name);
	}

	timerStart(timer: PBRTimer & { timer?: ReturnType<typeof setInterval> }): void {
		if (this._timers.find(t => t.name === timer.name)?.enabled) {
			this.logger.log("warning", `PBRContext: Timer "${timer.name}" already active, ignoring.`);
			return;
		}
		this._timers.push(timer);
	}

	timerStop(name: string): boolean {
		const timer = this._timers.find(t => t.name === name);
		if (!timer) return false;

		clearInterval(timer.timer);
		const idx = this._timers.indexOf(timer);
		if (idx >= 0) this._timers.splice(idx, 1);
		return true;
	}

	setPausable(pausable: boolean): void {
		this._setPausable(pausable);
	}

	stop(reason: string): void {
		this._stop(reason);
	}

	dispose(): void {
		this.pbrEmitter.dispose();
	}
}
