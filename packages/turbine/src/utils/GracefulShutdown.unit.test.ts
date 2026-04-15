import { describe, test, expect, vi, afterEach } from "vitest";
import { GracefulShutdown } from "./GracefulShutdown";

afterEach(() => {
	vi.useRealTimers();
});

describe("GracefulShutdown", () => {
	test("disposes resources in reverse registration order (LIFO)", async () => {
		const order: string[] = [];
		const shutdown = new GracefulShutdown();

		shutdown.register("first", () => { order.push("first"); });
		shutdown.register("second", () => { order.push("second"); });
		shutdown.register("third", () => { order.push("third"); });

		await shutdown.shutdown();

		expect(order).toEqual(["third", "second", "first"]);
	});

	test("error in one resource does not prevent others from running", async () => {
		const order: string[] = [];
		const shutdown = new GracefulShutdown();

		shutdown.register("a", () => { order.push("a"); });
		shutdown.register("b", () => { throw new Error("b failed"); });
		shutdown.register("c", () => { order.push("c"); });

		await shutdown.shutdown();

		expect(order).toEqual(["c", "a"]);
	});

	test("calling shutdown() twice is idempotent", async () => {
		let count = 0;
		const shutdown = new GracefulShutdown();

		shutdown.register("resource", () => { count++; });

		await shutdown.shutdown();
		await shutdown.shutdown();

		expect(count).toBe(1);
	});

	test("unregister removes a resource before shutdown", async () => {
		const order: string[] = [];
		const shutdown = new GracefulShutdown();

		shutdown.register("keep", () => { order.push("keep"); });
		shutdown.register("remove", () => { order.push("remove"); });

		shutdown.unregister("remove");

		await shutdown.shutdown();

		expect(order).toEqual(["keep"]);
	});

	test("handles async cleanup functions", async () => {
		const order: string[] = [];
		const shutdown = new GracefulShutdown();

		shutdown.register("async-resource", async () => {
			await new Promise(resolve => setTimeout(resolve, 10));
			order.push("async-done");
		});

		await shutdown.shutdown();

		expect(order).toEqual(["async-done"]);
	});

	test("times out if cleanup hangs", async () => {
		vi.useFakeTimers();
		const shutdown = new GracefulShutdown();

		shutdown.register("hanging", () => new Promise(() => {
			// never resolves
		}));

		const shutdownPromise = shutdown.shutdown();

		// Advance past the 10s timeout
		vi.advanceTimersByTime(11_000);

		await shutdownPromise;
		// Should complete without hanging (timeout catches it)

		vi.useRealTimers();
	});

	test("works with zero resources", async () => {
		const shutdown = new GracefulShutdown();
		await shutdown.shutdown();
		// no error
	});
});
