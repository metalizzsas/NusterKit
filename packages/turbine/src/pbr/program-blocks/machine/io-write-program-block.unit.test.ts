import { describe, expect, test, vi } from "vitest";
import { create_mock_pbr_context } from "../../test-utils";
import { IOWriteProgramBlock } from "./io-write-program-block";

describe("IOWriteProgramBlock", () => {
	test("calls ctx.io.write with correct gate name and value", async () => {
		const write_mock = vi.fn().mockResolvedValue(undefined);
		const ctx = create_mock_pbr_context({
			io: {
				write: write_mock,
				snapshot: () => ({}),
				reset_all: async () => {},
				get_gate_value: () => 0,
				on: () => {},
				off: () => {},
			},
		});

		const block = new IOWriteProgramBlock({ io_write: ["TestGate", 1] }, ctx);
		await block.execute();

		expect(write_mock).toHaveBeenCalledWith("TestGate", 1);
		expect(block.executed).toBe(true);
	});

	test("calls ctx.stop on write failure", async () => {
		const stop_mock = vi.fn();
		const ctx = create_mock_pbr_context({
			io: {
				write: vi.fn().mockRejectedValue(new Error("hardware error")),
				snapshot: () => ({}),
				reset_all: async () => {},
				get_gate_value: () => 0,
				on: () => {},
				off: () => {},
			},
			stop: stop_mock,
		});

		const block = new IOWriteProgramBlock({ io_write: ["TestGate", 1] }, ctx);
		await block.execute();

		expect(stop_mock).toHaveBeenCalledWith("controllerError");
		expect(block.executed).toBe(true);
	});
});
