import { test, expect } from "vitest";
import { IOReadParameterBlock } from "./IOReadParameterBlock";
import { createMockPBRContext } from "../../test-utils";
import type { IOGateJSON } from "$types/hydrated/io/index";

test("IOReadParameterBlock gets correct value from io.on listener", () => {
	let registeredListener: ((gate: IOGateJSON) => void) | undefined;

	const ctx = createMockPBRContext({
		io: {
			write: async () => {},
			snapshot: () => ({}),
			resetAll: async () => {},
			getGateValue: () => 0,
			on: (_event: string, listener: (gate: IOGateJSON) => void) => {
				registeredListener = listener;
			},
			off: () => {},
		},
	});

	const ioReadParameterBlock = new IOReadParameterBlock({ io_read: "test-gate" }, ctx);

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

	registeredListener!(gate);
	expect(ioReadParameterBlock.data).toBe(1);
});

test("IOReadParameterBlock starts at 0 before any update", () => {
	const ctx = createMockPBRContext();
	const ioReadParameterBlock = new IOReadParameterBlock({ io_read: "test-gate" }, ctx);
	expect(ioReadParameterBlock.data).toBe(0);
});
