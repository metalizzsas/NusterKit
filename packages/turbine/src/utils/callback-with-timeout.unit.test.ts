import { test, expect, describe, vi, afterEach } from "vitest";
import { callbackWithTimeout } from "./callback-with-timeout";

afterEach(() => {
	vi.useRealTimers();
});

describe("callbackWithTimeout", () => {
	test("resolves when callback fires before timeout", async () => {
		const result = await callbackWithTimeout<string>(
			(resolve) => {
				setTimeout(() => resolve("ok"), 10);
			},
			1000,
			"test"
		);
		expect(result).toBe("ok");
	});

	test("rejects with timeout error when callback never fires", async () => {
		vi.useFakeTimers();

		const promise = callbackWithTimeout<void>(
			() => {
				// never call resolve
			},
			500,
			"deadlock-test"
		);

		vi.advanceTimersByTime(500);

		await expect(promise).rejects.toThrow('callbackWithTimeout: "deadlock-test" timed out after 500ms');
	});

	test("only resolves once even if callback fires multiple times", async () => {
		let callCount = 0;

		const result = await callbackWithTimeout<number>(
			(resolve) => {
				resolve(1);
				callCount++;
				resolve(2);
				callCount++;
				resolve(3);
				callCount++;
			},
			1000,
			"multi-resolve"
		);

		expect(result).toBe(1);
		expect(callCount).toBe(3); // all calls execute, but only first resolve takes effect
	});

	test("clears internal timer on resolution (no leaked timers)", async () => {
		vi.useFakeTimers();

		const timersBefore = vi.getTimerCount();

		const promise = callbackWithTimeout<void>(
			(resolve) => {
				setTimeout(() => resolve(), 10);
			},
			5000,
			"leak-test"
		);

		// 2 timers: the 10ms callback timer + the 5000ms timeout
		expect(vi.getTimerCount()).toBe(timersBefore + 2);

		vi.advanceTimersByTime(10);
		await promise;

		// timeout timer should be cleared after resolution
		expect(vi.getTimerCount()).toBe(timersBefore);
	});
});
