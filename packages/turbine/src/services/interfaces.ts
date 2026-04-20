import type { ContainerHydrated } from "$types/hydrated/containers";
import type { IOGateJSON } from "$types/hydrated/io";
import type { MaintenanceHydrated } from "$types/hydrated/maintenance";
import type { ProfileHydrated } from "$types/hydrated/profiles";
import type { MachineSpecs } from "$types/index";

/**
 * IOBus — replaces io.update.*, io.snapshot, io.reset_all events.
 * Owns all IO gates, provides direct write/read methods + scoped fan-out for io.updated.*.
 */
export interface IOBus {
	write(gateName: string, value: number, lock?: boolean): Promise<void>;
	snapshot(): Record<string, number>;
	reset_all(): Promise<void>;
	get_gate_value(gateName: string): number | undefined;

	on(event: `updated.${string}`, listener: (gate: IOGateJSON) => void): void;
	off(event: `updated.${string}`, listener: (gate: IOGateJSON) => void): void;
}

/**
 * ContainerBus — replaces container.load/unload/read.* and regulation.* events.
 */
export interface ContainerBus {
	load(container_name: string, product_series: string): Promise<void>;
	unload(container_name: string): Promise<void>;
	read(container_name: string): Promise<ContainerHydrated>;

	get_regulation_state(container: string, regulation: string): boolean;
	set_regulation_state(container: string, regulation: string, state: boolean): Promise<boolean>;
	get_regulation_target(container: string, regulation: string): number;
	set_regulation_target(container: string, regulation: string, target: number): Promise<number>;

	on(event: `updated.${string}`, listener: (container: ContainerHydrated) => void): void;
	off(event: `updated.${string}`, listener: (container: ContainerHydrated) => void): void;
	on(event: `regulation.${string}.state_updated`, listener: (state: boolean) => void): void;
	off(event: `regulation.${string}.state_updated`, listener: (state: boolean) => void): void;
	on(event: `regulation.${string}.target_updated`, listener: (target: number) => void): void;
	off(event: `regulation.${string}.target_updated`, listener: (target: number) => void): void;
}

/**
 * MaintenanceBus — replaces maintenance.read/append.* events.
 */
export interface MaintenanceBus {
	read(task_name: string): MaintenanceHydrated | undefined;
	append(task_name: string, value: number): void;

	on(event: `updated.${string}`, listener: (m: MaintenanceHydrated) => void): void;
	off(event: `updated.${string}`, listener: (m: MaintenanceHydrated) => void): void;
}

/**
 * ProfileService — replaces profile.read event.
 */
export interface ProfileService {
	find_profile(id: string): Promise<ProfileHydrated | undefined>;
}

/**
 * MachineService — replaces machine.read_variable.* and machine.config events.
 */
export interface MachineService {
	read_variable(name: string): number;
	get_config(): MachineSpecs;
}

/**
 * Logger — replaces TurbineEventLoop.emit('log', level, message).
 */
export interface Logger {
	log(level: "trace" | "info" | "warning" | "error" | "fatal", message: string): void;
}

/**
 * ServiceRegistry — bundles all service interfaces, passed from Machine to CycleRouter to PBR.
 */
export interface ServiceRegistry {
	io: IOBus;
	containers: ContainerBus;
	maintenance: MaintenanceBus;
	profiles: ProfileService;
	machine: MachineService;
	logger: Logger;
}
