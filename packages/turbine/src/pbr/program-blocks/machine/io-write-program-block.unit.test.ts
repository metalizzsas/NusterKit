import { test, expect, describe, vi } from "vitest";
import { IOWriteProgramBlock } from "./io-write-program-block";
import { createMockPBRContext } from "../../test-utils";

describe("IOWriteProgramBlock", () => {
	test("calls ctx.io.write with correct gate name and value", async () => {
		const writeMock = vi.fn().mockResolvedValue(undefined);
		const ctx = createMockPBRContext({
			io: {
				write: writeMock,
				snapshot: () => ({}),
				resetAll: async () => {},
				getGateValue: () => 0,
				on: () => {},
				off: () => {},
			},
		});

		const block = new IOWriteProgramBlock({ io_write: ["TestGate", 1] }, ctx);
		await block.execute();

		expect(writeMock).toHaveBeenCalledWith("TestGate", 1);
		expect(block.executed).toBe(true);
	});

	test("calls ctx.stop on write failure", async () => {
		const stopMock = vi.fn();
		const ctx = createMockPBRContext({
			io: {
				write: vi.fn().mockRejectedValue(new Error("hardware error")),
				snapshot: () => ({}),
				resetAll: async () => {},
				getGateValue: () => 0,
				on: () => {},
				off: () => {},
			},
			stop: stopMock,
		});

		const block = new IOWriteProgramBlock({ io_write: ["TestGate", 1] }, ctx);
		await block.execute();

		expect(stopMock).toHaveBeenCalledWith("controllerError");
		expect(block.executed).toBe(true);
	});
});
