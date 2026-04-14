import { test, expect, describe } from "vitest";
import { AsyncMutex } from "./AsyncMutex";

describe("AsyncMutex", () => {
	test("acquire() resolves immediately when unlocked", async () => {
		const mutex = new AsyncMutex();
		await mutex.acquire(); // should not hang
		mutex.release();
	});

	test("acquire() blocks when locked, resolves when released", async () => {
		const mutex = new AsyncMutex();
		const order: number[] = [];

		await mutex.acquire();
		order.push(1);

		const secondAcquire = mutex.acquire().then(() => {
			order.push(2);
		});

		// second acquire should not have resolved yet
		await Promise.resolve(); // flush microtasks
		expect(order).toEqual([1]);

		mutex.release();
		await secondAcquire;

		expect(order).toEqual([1, 2]);
		mutex.release();
	});

	test("serializes 3 concurrent acquire() calls in order", async () => {
		const mutex = new AsyncMutex();
		const order: number[] = [];

		await mutex.acquire();

		const p1 = mutex.acquire().then(() => {
			order.push(1);
			mutex.release();
		});

		const p2 = mutex.acquire().then(() => {
			order.push(2);
			mutex.release();
		});

		const p3 = mutex.acquire().then(() => {
			order.push(3);
			mutex.release();
		});

		mutex.release(); // unblock p1
		await Promise.all([p1, p2, p3]);

		expect(order).toEqual([1, 2, 3]);
	});

	test("release() without pending waiters unlocks the mutex", async () => {
		const mutex = new AsyncMutex();
		await mutex.acquire();
		mutex.release(); // no pending waiters — just unlocks

		// should be able to acquire again immediately
		await mutex.acquire();
		mutex.release();
	});
});
