import type { PBRTimer } from "$types/hydrated/cycle/program-block-runner-hydrated";
import type { ProfileHydrated } from "$types/hydrated/profiles";
import type { ContainerBus, IOBus, Logger, MachineService, MaintenanceBus, ProfileService, ServiceRegistry } from "./interfaces";
import type { PBRContext, PBREmitter, PBREmitterEvents } from "./pbr-context";
import { ScopedEmitter } from "./scoped-emitter";

export interface PBRContextOptions {
	services: ServiceRegistry;
	variables: Array<{ name: string; value: number }>;
	timers: (PBRTimer & { timer?: ReturnType<typeof setInterval> })[];
	profile?: ProfileHydrated;
	set_pausable: (pausable: boolean) => void;
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

	pbr_emitter: PBREmitter;

	private _variables: Array<{ name: string; value: number }>;
	private _timers: (PBRTimer & { timer?: ReturnType<typeof setInterval> })[];
	private _profile?: ProfileHydrated;
	private _set_pausable: (pausable: boolean) => void;
	private _stop: (reason: string) => void;

	constructor(options: PBRContextOptions) {
		this.io = options.services.io;
		this.containers = options.services.containers;
		this.maintenance = options.services.maintenance;
		this.profiles = options.services.profiles;
		this.machine = options.services.machine;
		this.logger = options.services.logger;

		this.pbr_emitter = new ScopedEmitter<PBREmitterEvents>();

		this._variables = options.variables;
		this._timers = options.timers;
		this._profile = options.profile;
		this._set_pausable = options.set_pausable;
		this._stop = options.stop;
	}

	read_variable(name: string): number {
		return this._variables.find((v) => v.name === name)?.value ?? 0;
	}

	write_variable(name: string, value: number): void {
		const existing = this._variables.find((v) => v.name === name);
		if (existing) {
			existing.value = value;
		} else {
			this._variables.push({ name, value });
		}
		this.pbr_emitter.emit("variable.write", { name, value });
	}

	read_profile(): ProfileHydrated | undefined {
		return this._profile;
	}

	timer_exists(name: string): boolean {
		return this._timers.some((t) => t.name === name);
	}

	timer_start(timer: PBRTimer & { timer?: ReturnType<typeof setInterval> }): void {
		if (this._timers.find((t) => t.name === timer.name)?.enabled) {
			this.logger.log("warning", `PBRContext: Timer "${timer.name}" already active, ignoring.`);
			return;
		}
		this._timers.push(timer);
	}

	timer_stop(name: string): boolean {
		const timer = this._timers.find((t) => t.name === name);
		if (!timer) return false;

		clearInterval(timer.timer);
		const idx = this._timers.indexOf(timer);
		if (idx >= 0) this._timers.splice(idx, 1);
		return true;
	}

	set_pausable(pausable: boolean): void {
		this._set_pausable(pausable);
	}

	stop(reason: string): void {
		this._stop(reason);
	}

	dispose(): void {
		this.pbr_emitter.dispose();
	}
}
