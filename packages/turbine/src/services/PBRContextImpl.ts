import type { PBRContext, PBREmitter, PBREmitterEvents } from "./PBRContext";
import type { ServiceRegistry } from "./interfaces";
import type { IOBus, ContainerBus, MaintenanceBus, ProfileService, MachineService, Logger } from "./interfaces";
import type { ProfileHydrated } from "$types/hydrated/profiles";
import type { PBRTimer } from "$types/hydrated/cycle/ProgramBlockRunnerHydrated";
import { ScopedEmitter } from "./ScopedEmitter";

export interface PBRContextOptions {
	services: ServiceRegistry;
	variables: Array<{ name: string; value: number }>;
	timers: (PBRTimer & { timer?: ReturnType<typeof setInterval> })[];
	profile?: ProfileHydrated;
	setPausable: (pausable: boolean) => void;
	stop: (reason: string) => void;
}

/**
 * Concrete PBRContext implementation.
 * Created per PBR run. All state is passed at construction time.
 */
export class PBRContextImpl implements PBRContext {
	io: IOBus;
	containers: ContainerBus;
	maintenance: MaintenanceBus;
	profiles: ProfileService;
	machine: MachineService;
	logger: Logger;

	pbrEmitter: PBREmitter;

	private _variables: Array<{ name: string; value: number }>;
	private _timers: (PBRTimer & { timer?: ReturnType<typeof setInterval> })[];
	private _profile?: ProfileHydrated;
	private _setPausable: (pausable: boolean) => void;
	private _stop: (reason: string) => void;

	constructor(options: PBRContextOptions) {
		this.io = options.services.io;
		this.containers = options.services.containers;
		this.maintenance = options.services.maintenance;
		this.profiles = options.services.profiles;
		this.machine = options.services.machine;
		this.logger = options.services.logger;

		this.pbrEmitter = new ScopedEmitter<PBREmitterEvents>();

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
