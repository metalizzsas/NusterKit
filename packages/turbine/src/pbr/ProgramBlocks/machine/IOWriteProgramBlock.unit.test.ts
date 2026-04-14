import { test, expect, describe, vi, beforeEach, afterEach } from "vitest";
import { TurbineEventLoop } from "../../../events";
import { IOWriteProgramBlock } from "./IOWriteProgramBlock";

afterEach(() => {
	vi.useRealTimers();
	TurbineEventLoop.removeAllListeners("io.update.TestGate");
	TurbineEventLoop.removeAllListeners("pbr.stop");
	TurbineEventLoop.removeAllListeners("pbr.status.update");
	TurbineEventLoop.removeAllListeners("pbr.pause");
	TurbineEventLoop.removeAllListeners("pbr.resume");
	TurbineEventLoop.removeAllListeners("log");
});

function createBlock(): IOWriteProgramBlock {
	return new IOWriteProgramBlock({
		io_write: ["TestGate", 1]
	});
}

describe("IOWriteProgramBlock timer cleanup", () => {
	test("all timers are cleaned up after successful write", async () => {
		vi.useFakeTimers();

		// Register a listener that calls callback immediately
		TurbineEventLoop.on("io.update.TestGate", (options) => {
			options.callback?.();
		});

		// Suppress log events
		TurbineEventLoop.on("log", () => {});

		const block = createBlock();

		const timersBeforeExecute = vi.getTimerCount();
		const promise = block.execute();

		// The emit is synchronous, so callback fires immediately -> settle() clears all timers
		await promise;

		expect(block.executed).toBe(true);
		// All timers created by execute() should be cleaned up
		expect(vi.getTimerCount()).toBe(timersBeforeExecute);

		// dispose() added in Item 8 commit
	});

	test("abort signal resolves the promise and cleans up timers", async () => {
		vi.useFakeTimers();

		// No listener for io.update — simulates unresponsive hardware
		TurbineEventLoop.on("log", () => {});

		const controller = new AbortController();
		const block = createBlock();

		const timersBeforeExecute = vi.getTimerCount();
		const promise = block.execute(controller.signal);

		// Abort after 100ms
		vi.advanceTimersByTime(100);
		controller.abort();

		// The 250ms interval check should detect the abort
		vi.advanceTimersByTime(250);
		await promise;

		expect(block.executed).toBe(true);
		expect(vi.getTimerCount()).toBe(timersBeforeExecute);

		// dispose() added in Item 8 commit
	});

	test("timeout path emits pbr.stop and resolves", async () => {
		vi.useFakeTimers();

		// No listener for io.update — simulates unresponsive hardware
		TurbineEventLoop.on("log", () => {});

		let stopReason: string | undefined;
		TurbineEventLoop.on("pbr.stop", (reason) => {
			stopReason = reason;
		});

		const block = createBlock();
		const promise = block.execute();

		// Advance past 2s timeout
		vi.advanceTimersByTime(2000);
		await promise;

		expect(stopReason).toBe("controllerError");
		expect(block.executed).toBe(true);

		// dispose() added in Item 8 commit
	});
});
