import { expect, test } from "vitest";
import type { IOGateJSON } from "$types/hydrated/io/index";
import { create_mock_pbr_context } from "../../test-utils";
import { IOReadParameterBlock } from "./io-read-parameter-block";

test("IOReadParameterBlock gets correct value from io.on listener", () => {
	let registered_listener: ((gate: IOGateJSON) => void) | undefined;

	const ctx = create_mock_pbr_context({
		io: {
			write: async () => {},
			snapshot: () => ({}),
			reset_all: async () => {},
			get_gate_value: () => 0,
			on: (_event: string, listener: (gate: IOGateJSON) => void) => {
				registered_listener = listener;
			},
			off: () => {},
		},
	});

	const io_read_parameter_block = new IOReadParameterBlock({ io_read: "test-gate" }, ctx);

	// Simulate gate update
	const gate: IOGateJSON = {
		name: "test-gate",
		category: "generic",
		locked: false,
		unity: undefined,
		type: "default",
		value: 1,
		size: "bit",
		bus: "in",
	};

	registered_listener!(gate);
	expect(io_read_parameter_block.data).toBe(1);
});

test("IOReadParameterBlock starts at 0 before any update", () => {
	const ctx = create_mock_pbr_context();
	const io_read_parameter_block = new IOReadParameterBlock({ io_read: "test-gate" }, ctx);
	expect(io_read_parameter_block.data).toBe(0);
});
