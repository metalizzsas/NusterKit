import { test, expect } from "vitest";
import { GetRegulationStateParameterBlock } from "./get-regulation-state-parameter-block";
import { createMockPBRContext } from "../../test-utils";

test("GetRegulationStateParameterBlock gets initial state from containers", () => {
	const ctx = createMockPBRContext({
		containers: {
			load: async () => {},
			unload: async () => {},
			read: async () => undefined as never,
			setRegulationState: async () => false,
			getRegulationState: () => true,
			getRegulationTarget: () => 0,
			setRegulationTarget: async () => 0,
			on: () => {},
			off: () => {},
		},
	});

	const block = new GetRegulationStateParameterBlock({
		get_regulation_state: {
			container: "test-container",
			regulation: "test-regulation",
		},
	}, ctx);

	expect(block.data).toBe(1);
});

test("GetRegulationStateParameterBlock updates via containers.on listener", () => {
	let registeredListener: ((state: boolean) => void) | undefined;

	const ctx = createMockPBRContext({
		containers: {
			load: async () => {},
			unload: async () => {},
			read: async () => undefined as never,
			setRegulationState: async () => false,
			getRegulationState: () => false,
			getRegulationTarget: () => 0,
			setRegulationTarget: async () => 0,
			on: (_event: string, listener: (state: boolean) => void) => {
				registeredListener = listener;
			},
			off: () => {},
		},
	});

	const block = new GetRegulationStateParameterBlock({
		get_regulation_state: {
			container: "test-container",
			regulation: "test-regulation",
		},
	}, ctx);

	expect(block.data).toBe(0); // initially false

	registeredListener!(true);
	expect(block.data).toBe(1);
});
