import type { PBRContext, PBREmitterEvents } from "../services/pbr-context";
import type { ServiceRegistry } from "../services/interfaces";
import { ScopedEmitter } from "../services/scoped-emitter";

/**
 * Creates a minimal mock PBRContext for unit tests.
 */
export function createMockPBRContext(overrides?: Partial<PBRContext>): PBRContext {
	const pbrEmitter = new ScopedEmitter<PBREmitterEvents>();

	return {
		io: {
			write: async () => {},
			snapshot: () => ({}),
			resetAll: async () => {},
			getGateValue: () => 0,
			on: () => {},
			off: () => {},
		},
		containers: {
			load: async () => {},
			unload: async () => {},
			read: async () => undefined as never,
			setRegulationState: async () => false,
			getRegulationState: () => false,
			getRegulationTarget: () => 0,
			setRegulationTarget: async () => 0,
			on: () => {},
			off: () => {},
		},
		maintenance: {
			append: () => {},
			read: () => undefined as never,
			on: () => {},
			off: () => {},
		},
		profiles: {
			findProfile: async () => undefined,
		},
		machine: {
			getConfig: () => ({ profileSkeletons: [] }) as never,
			readVariable: () => 0,
		},
		logger: {
			log: () => {},
		},
		pbrEmitter,
		readVariable: () => 0,
		writeVariable: () => {},
		readProfile: () => undefined,
		timerExists: () => false,
		timerStart: () => {},
		timerStop: () => false,
		setPausable: () => {},
		stop: () => {},
		...overrides,
	} as PBRContext;
}

/**
 * Creates a minimal mock ServiceRegistry for ProgramBlockRunner tests.
 */
export function createMockServiceRegistry(overrides?: Partial<ServiceRegistry>): ServiceRegistry {
	return {
		io: {
			write: async () => {},
			snapshot: () => ({}),
			resetAll: async () => {},
			getGateValue: () => 0,
			on: () => {},
			off: () => {},
		},
		containers: {
			load: async () => {},
			unload: async () => {},
			read: async () => undefined as never,
			setRegulationState: async () => false,
			getRegulationState: () => false,
			getRegulationTarget: () => 0,
			setRegulationTarget: async () => 0,
			on: () => {},
			off: () => {},
		},
		maintenance: {
			append: () => {},
			read: () => undefined as never,
			on: () => {},
			off: () => {},
		},
		profiles: {
			findProfile: async () => undefined,
		},
		machine: {
			getConfig: () => ({ profileSkeletons: [] }) as never,
			readVariable: () => 0,
		},
		logger: {
			log: () => {},
		},
		...overrides,
	} as ServiceRegistry;
}
