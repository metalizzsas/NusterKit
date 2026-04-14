import type { IOGateJSON } from "$types/hydrated/io";
import type { ContainerHydrated } from "$types/hydrated/containers";
import type { MaintenanceHydrated } from "$types/hydrated/maintenance";
import type { ProfileHydrated } from "$types/hydrated/profiles";
import type { MachineSpecs } from "$types/index";

/**
 * IOBus — replaces io.update.*, io.snapshot, io.resetAll events.
 * Owns all IO gates, provides direct write/read methods + scoped fan-out for io.updated.*.
 */
export interface IOBus {
	write(gateName: string, value: number, lock?: boolean): Promise<void>;
	snapshot(): Record<string, number>;
	resetAll(): Promise<void>;
	getGateValue(gateName: string): number | undefined;

	on(event: `updated.${string}`, listener: (gate: IOGateJSON) => void): void;
	off(event: `updated.${string}`, listener: (gate: IOGateJSON) => void): void;
}

/**
 * ContainerBus — replaces container.load/unload/read.* and regulation.* events.
 */
export interface ContainerBus {
	load(containerName: string, productSeries: string): Promise<void>;
	unload(containerName: string): Promise<void>;
	read(containerName: string): Promise<ContainerHydrated>;

	getRegulationState(container: string, regulation: string): boolean;
	setRegulationState(container: string, regulation: string, state: boolean): Promise<boolean>;
	getRegulationTarget(container: string, regulation: string): number;
	setRegulationTarget(container: string, regulation: string, target: number): Promise<number>;

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
	read(taskName: string): MaintenanceHydrated | undefined;
	append(taskName: string, value: number): void;

	on(event: `updated.${string}`, listener: (m: MaintenanceHydrated) => void): void;
	off(event: `updated.${string}`, listener: (m: MaintenanceHydrated) => void): void;
}

/**
 * ProfileService — replaces profile.read event.
 */
export interface ProfileService {
	findProfile(id: string): Promise<ProfileHydrated | undefined>;
}

/**
 * MachineService — replaces machine.read_variable.* and machine.config events.
 */
export interface MachineService {
	readVariable(name: string): number;
	getConfig(): MachineSpecs;
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
