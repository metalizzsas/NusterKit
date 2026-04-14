import { test, expect, describe, vi } from "vitest";
import { IOBusAdapter } from "./IOBusAdapter";
import type { IOGatesHydrated } from "$types/hydrated/io";

function createMockGate(overrides: Partial<IOGatesHydrated> = {}): IOGatesHydrated {
	return {
		name: "TestGate",
		type: "default",
		bus: "out",
		size: "bit",
		address: 0,
		controllerId: 0,
		default: 0,
		category: "test",
		value: 0,
		locked: false,
		unity: undefined,
		read: vi.fn().mockResolvedValue(true),
		write: vi.fn().mockResolvedValue(true),
		...overrides,
	} as unknown as IOGatesHydrated;
}

describe("IOBusAdapter", () => {
	test("write finds gate and calls gate.write()", async () => {
		const gate = createMockGate({ name: "Pump#1" });
		const bus = new IOBusAdapter([gate]);

		await bus.write("Pump#1", 1);

		expect(gate.write).toHaveBeenCalledWith(1);
	});

	test("write with lock=true sets gate.locked", async () => {
		const gate = createMockGate({ name: "Heater", locked: false });
		const bus = new IOBusAdapter([gate]);

		await bus.write("Heater", 1, true);

		expect(gate.locked).toBe(true);
		expect(gate.write).toHaveBeenCalledWith(1);
	});

	test("write throws on unknown gate name", async () => {
		const bus = new IOBusAdapter([]);

		await expect(bus.write("NonExistent", 1)).rejects.toThrow('IOBus: Gate "NonExistent" not found');
	});

	test("snapshot returns only unlocked output gates", () => {
		const gates = [
			createMockGate({ name: "Out1", bus: "out", locked: false, value: 5 }),
			createMockGate({ name: "Out2", bus: "out", locked: true, value: 10 }),
			createMockGate({ name: "In1", bus: "in", locked: false, value: 3 }),
			createMockGate({ name: "Out3", bus: "out", locked: false, value: 7 }),
		];
		const bus = new IOBusAdapter(gates);

		const snap = bus.snapshot();

		expect(snap).toEqual({ Out1: 5, Out3: 7 });
		expect(snap).not.toHaveProperty("Out2"); // locked
		expect(snap).not.toHaveProperty("In1");  // input
	});

	test("resetAll writes defaults to all output gates", async () => {
		const gates = [
			createMockGate({ name: "Out1", bus: "out", default: 0, value: 5 }),
			createMockGate({ name: "Out2", bus: "out", default: 1, value: 0 }),
			createMockGate({ name: "In1", bus: "in", default: 0, value: 3 }),
		];
		const bus = new IOBusAdapter(gates);

		await bus.resetAll();

		expect(gates[0].write).toHaveBeenCalledWith(0);
		expect(gates[1].write).toHaveBeenCalledWith(1);
		expect(gates[2].write).not.toHaveBeenCalled(); // input gate not reset
	});

	test("getGateValue returns current value", () => {
		const gate = createMockGate({ name: "Sensor1", value: 42 });
		const bus = new IOBusAdapter([gate]);

		expect(bus.getGateValue("Sensor1")).toBe(42);
		expect(bus.getGateValue("Unknown")).toBeUndefined();
	});
});
