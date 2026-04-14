import type { IOBus } from "./interfaces";
import type { IOGatesHydrated, IOGateJSON } from "$types/hydrated/io";
import { TurbineEventLoop } from "../events";

/**
 * IOBus adapter — wraps the IORouter gates array and provides direct
 * method access for write, snapshot, and resetAll operations.
 *
 * During the transition period, fan-out subscriptions (`on/off`) are
 * bridged through TurbineEventLoop. In Phase 2.7, IOGate will emit
 * directly on this adapter's scoped emitter instead.
 */
export class IOBusAdapter implements IOBus {
	private gates: IOGatesHydrated[];

	constructor(gates: IOGatesHydrated[]) {
		this.gates = gates;
	}

	private findGate(gateName: string): IOGatesHydrated {
		const gate = this.gates.find(g => g.name === gateName);
		if (!gate) throw new Error(`IOBus: Gate "${gateName}" not found`);
		return gate;
	}

	async write(gateName: string, value: number, lock?: boolean): Promise<void> {
		const gate = this.findGate(gateName);

		if (lock !== undefined) {
			gate.locked = lock;
		}

		await gate.write(value);
		// gate.write() already emits io.updated.* on TurbineEventLoop
	}

	snapshot(): Record<string, number> {
		return this.gates
			.filter(g => g.bus === "out" && !g.locked)
			.reduce((acc, gate) => {
				acc[gate.name] = gate.value;
				return acc;
			}, {} as Record<string, number>);
	}

	async resetAll(): Promise<void> {
		for (const gate of this.gates.filter(g => g.bus === "out")) {
			await gate.write(gate.default);
		}
	}

	getGateValue(gateName: string): number | undefined {
		return this.gates.find(g => g.name === gateName)?.value;
	}

	/**
	 * Transition bridge: subscribes to io.updated.* via TurbineEventLoop.
	 * In Phase 2.7, this will switch to a scoped emitter owned by IOBus.
	 */
	on(event: `updated.${string}`, listener: (gate: IOGateJSON) => void): void {
		const ioEvent = event.replace("updated.", "io.updated.") as `io.updated.${string}`;
		TurbineEventLoop.on(ioEvent, listener);
	}

	off(event: `updated.${string}`, listener: (gate: IOGateJSON) => void): void {
		const ioEvent = event.replace("updated.", "io.updated.") as `io.updated.${string}`;
		TurbineEventLoop.removeListener(ioEvent, listener);
	}
}
