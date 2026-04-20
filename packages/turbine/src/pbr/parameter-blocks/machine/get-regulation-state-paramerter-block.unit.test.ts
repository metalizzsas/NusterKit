import { expect, test } from "vitest";
import { create_mock_pbr_context } from "../../test-utils";
import { GetRegulationStateParameterBlock } from "./get-regulation-state-parameter-block";

test("GetRegulationStateParameterBlock gets initial state from containers", () => {
	const ctx = create_mock_pbr_context({
		containers: {
			load: async () => {},
			unload: async () => {},
			read: async () => undefined as never,
			set_regulation_state: async () => false,
			get_regulation_state: () => true,
			get_regulation_target: () => 0,
			set_regulation_target: async () => 0,
			on: () => {},
			off: () => {},
		},
	});

	const block = new GetRegulationStateParameterBlock(
		{
			get_regulation_state: {
				container: "test-container",
				regulation: "test-regulation",
			},
		},
		ctx,
	);

	expect(block.data).toBe(1);
});

test("GetRegulationStateParameterBlock updates via containers.on listener", () => {
	let registered_listener: ((state: boolean) => void) | undefined;

	const ctx = create_mock_pbr_context({
		containers: {
			load: async () => {},
			unload: async () => {},
			read: async () => undefined as never,
			set_regulation_state: async () => false,
			get_regulation_state: () => false,
			get_regulation_target: () => 0,
			set_regulation_target: async () => 0,
			on: (_event: string, listener: (state: boolean) => void) => {
				registered_listener = listener;
			},
			off: () => {},
		},
	});

	const block = new GetRegulationStateParameterBlock(
		{
			get_regulation_state: {
				container: "test-container",
				regulation: "test-regulation",
			},
		},
		ctx,
	);

	expect(block.data).toBe(0); // initially false

	registered_listener!(true);
	expect(block.data).toBe(1);
});
