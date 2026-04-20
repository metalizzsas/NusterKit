import type { ServiceRegistry } from "../services/interfaces";
import type { PBRContext, PBREmitterEvents } from "../services/pbr-context";
import { ScopedEmitter } from "../services/scoped-emitter";

/**
 * Creates a minimal mock PBRContext for unit tests.
 */
export function create_mock_pbr_context(overrides?: Partial<PBRContext>): PBRContext {
	const pbr_emitter = new ScopedEmitter<PBREmitterEvents>();

	return {
		io: {
			write: async () => {},
			snapshot: () => ({}),
			reset_all: async () => {},
			get_gate_value: () => 0,
			on: () => {},
			off: () => {},
		},
		containers: {
			load: async () => {},
			unload: async () => {},
			read: async () => undefined as never,
			set_regulation_state: async () => false,
			get_regulation_state: () => false,
			get_regulation_target: () => 0,
			set_regulation_target: async () => 0,
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
			find_profile: async () => undefined,
		},
		machine: {
			get_config: () => ({ profileSkeletons: [] }) as never,
			read_variable: () => 0,
		},
		logger: {
			log: () => {},
		},
		pbr_emitter,
		read_variable: () => 0,
		write_variable: () => {},
		read_profile: () => undefined,
		timer_exists: () => false,
		timer_start: () => {},
		timer_stop: () => false,
		set_pausable: () => {},
		stop: () => {},
		...overrides,
	} as PBRContext;
}

/**
 * Creates a minimal mock ServiceRegistry for ProgramBlockRunner tests.
 */
export function create_mock_service_registry(overrides?: Partial<ServiceRegistry>): ServiceRegistry {
	return {
		io: {
			write: async () => {},
			snapshot: () => ({}),
			reset_all: async () => {},
			get_gate_value: () => 0,
			on: () => {},
			off: () => {},
		},
		containers: {
			load: async () => {},
			unload: async () => {},
			read: async () => undefined as never,
			set_regulation_state: async () => false,
			get_regulation_state: () => false,
			get_regulation_target: () => 0,
			set_regulation_target: async () => 0,
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
			find_profile: async () => undefined,
		},
		machine: {
			get_config: () => ({ profileSkeletons: [] }) as never,
			read_variable: () => 0,
		},
		logger: {
			log: () => {},
		},
		...overrides,
	} as ServiceRegistry;
}
