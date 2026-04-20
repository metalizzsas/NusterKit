import { afterEach, describe, expect, test, vi } from "vitest";
import { callback_with_timeout } from "./callback-with-timeout";

afterEach(() => {
	vi.useRealTimers();
});

describe("callback_with_timeout", () => {
	test("resolves when callback fires before timeout", async () => {
		const result = await callback_with_timeout<string>(
			(resolve) => {
				setTimeout(() => resolve("ok"), 10);
			},
			1000,
			"test",
		);
		expect(result).toBe("ok");
	});

	test("rejects with timeout error when callback never fires", async () => {
		vi.useFakeTimers();

		const promise = callback_with_timeout<void>(
			() => {
				// never call resolve
			},
			500,
			"deadlock-test",
		);

		vi.advanceTimersByTime(500);

		await expect(promise).rejects.toThrow('callback_with_timeout: "deadlock-test" timed out after 500ms');
	});

	test("only resolves once even if callback fires multiple times", async () => {
		let call_count = 0;

		const result = await callback_with_timeout<number>(
			(resolve) => {
				resolve(1);
				call_count++;
				resolve(2);
				call_count++;
				resolve(3);
				call_count++;
			},
			1000,
			"multi-resolve",
		);

		expect(result).toBe(1);
		expect(call_count).toBe(3); // all calls execute, but only first resolve takes effect
	});

	test("clears internal timer on resolution (no leaked timers)", async () => {
		vi.useFakeTimers();

		const timers_before = vi.getTimerCount();

		const promise = callback_with_timeout<void>(
			(resolve) => {
				setTimeout(() => resolve(), 10);
			},
			5000,
			"leak-test",
		);

		// 2 timers: the 10ms callback timer + the 5000ms timeout
		expect(vi.getTimerCount()).toBe(timers_before + 2);

		vi.advanceTimersByTime(10);
		await promise;

		// timeout timer should be cleared after resolution
		expect(vi.getTimerCount()).toBe(timers_before);
	});
});
