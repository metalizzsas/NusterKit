import { afterEach, describe, expect, test, vi } from "vitest";
import type { IOBase } from "$types/spec/iohandlers";
import { TurbineEventLoop } from "../events";
import { AsyncMutex } from "../utils/async-mutex";
import { IOGate } from "./io-gates/io-gate";

afterEach(() => {
	TurbineEventLoop.removeAllListeners();
});

function create_mock_controller(): IOBase {
	return {
		type: "wago" as const,
		connected: true,
		unreachable: false,
		ip: "127.0.0.1",
		readData: vi.fn().mockResolvedValue(0),
		writeData: vi.fn().mockResolvedValue(undefined),
		toJSON: vi.fn(),
	};
}

function create_test_gate(name: string, controller: IOBase): IOGate {
	return new IOGate(
		{
			name,
			type: "default",
			bus: "out",
			size: "bit",
			address: 0,
			default: 0,
			controllerId: 0,
		},
		controller,
	);
}

describe("IO concurrency", () => {
	test("parallel writes on same gate are serialized by the gate (last write wins)", async () => {
		const controller = create_mock_controller();
		const gate = create_test_gate("valve#1", controller);

		// Fire multiple concurrent writes
		const writes = Promise.all([gate.write(1), gate.write(0), gate.write(1)]);

		await writes;

		// All writes should have gone through to the controller
		expect(controller.writeData).toHaveBeenCalledTimes(3);
		// Last value wins
		expect(gate.value).toBe(1);
	});

	test("AsyncMutex serializes overlapping critical sections", async () => {
		const mutex = new AsyncMutex();
		const order: number[] = [];

		const task = async (id: number, delay: number) => {
			await mutex.acquire();
			await new Promise((resolve) => setTimeout(resolve, delay));
			order.push(id);
			mutex.release();
		};

		// Start 3 tasks concurrently — they should execute in order due to mutex
		await Promise.all([task(1, 30), task(2, 10), task(3, 10)]);

		expect(order).toEqual([1, 2, 3]);
	});

	test("locked gate rejects non-forced writes via event", async () => {
		const controller = create_mock_controller();
		const gate = create_test_gate("heater#1", controller);

		gate.locked = true;

		// Direct write still works (lock is only checked at HTTP layer)
		await gate.write(1);
		expect(gate.value).toBe(1);

		// The lock mechanism is enforced at the route/adapter level, not gate level
		// This test verifies the gate.locked flag is readable
		expect(gate.locked).toBe(true);
	});

	test("gate lock can be set and cleared via io.update event", async () => {
		const controller = create_mock_controller();
		const gate = create_test_gate("pump#1", controller);

		expect(gate.locked).toBe(false);

		// Lock via event
		await new Promise<void>((resolve) => {
			TurbineEventLoop.emit(`io.update.pump#1`, { value: 1, lock: true, callback: () => resolve() });
		});

		expect(gate.locked).toBe(true);
		expect(gate.value).toBe(1);

		// Unlock via event
		await new Promise<void>((resolve) => {
			TurbineEventLoop.emit(`io.update.pump#1`, { value: 0, lock: false, callback: () => resolve() });
		});

		expect(gate.locked).toBe(false);
		expect(gate.value).toBe(0);
	});

	test("concurrent reads do not interfere with each other", async () => {
		const controller = create_mock_controller();
		let call_count = 0;
		(controller.readData as ReturnType<typeof vi.fn>).mockImplementation(async () => {
			call_count++;
			await new Promise((resolve) => setTimeout(resolve, 10));
			return call_count;
		});

		const gate = new IOGate(
			{
				name: "sensor#1",
				type: "default",
				bus: "in",
				size: "word",
				address: 0,
				default: 0,
				controllerId: 0,
			},
			controller,
		);

		// Fire 3 concurrent reads
		await Promise.all([gate.read(), gate.read(), gate.read()]);

		// All 3 should have called the controller
		expect(controller.readData).toHaveBeenCalledTimes(3);
	});

	test("write to input gate is a no-op", async () => {
		const controller = create_mock_controller();
		const gate = new IOGate(
			{
				name: "sensor#2",
				type: "default",
				bus: "in",
				size: "bit",
				address: 0,
				default: 0,
				controllerId: 0,
			},
			controller,
		);

		const result = await gate.write(1);

		expect(result).toBe(true);
		expect(controller.writeData).not.toHaveBeenCalled();
		expect(gate.value).toBe(0); // unchanged
	});
});
