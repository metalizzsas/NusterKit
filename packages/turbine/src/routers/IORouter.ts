import { TurbineEventLoop } from "../events";
import { IOGate } from "../io/IOGates/IOGate";
import { MappedGate } from "../io/IOGates/MappedGate";
import { PT100Gate } from "../io/IOGates/PT100Gate";
import { EX260Sx } from "../io/IOHandlers/EX260Sx";
import { WAGO } from "../io/IOHandlers/WAGO";
import type { IOBus } from "../services/interfaces";
import type { IOGateJSON, IOGatesHydrated } from "../types/hydrated/io";
import type { IOGates } from "../types/spec/iogates";
import type { IOBase, IOHandlers } from "../types/spec/iohandlers";

export class IORouter implements IOBus {
	/** IO Physical handlers */
	handlers: IOBase[] = [];
	/** IO Physical gates */
	gates: IOGatesHydrated[] = [];

	/** IO Scanner interval timer */
	private timer?: ReturnType<typeof setInterval>;

	private ioScannerInterval = 500;

	/** Previous gate values for change detection */
	private previousValues = new Map<string, number>();

	constructor(handlers: IOHandlers[], gates: IOGates[]) {
		// Register IO Handlers from their types
		for (const handler of handlers) {
			if (process.env.NODE_ENV != "production") handler.ip = "127.0.0.1";

			if (process.env.SIMULATION_ADDRESS !== undefined) handler.ip = process.env.SIMULATION_ADDRESS;

			if (handler.ioScannerInterval !== undefined) this.ioScannerInterval = handler.ioScannerInterval;

			switch (handler.type) {
				case "wago":
					this.handlers.push(new WAGO(handler.ip));
					break;
				case "ex260sx":
					this.handlers.push(new EX260Sx(handler.ip, handler.size));
					break;
			}
		}

		// Register gates from their correspondig type
		for (const gate of gates) {
			switch (gate.type) {
				case "mapped":
					this.gates.push(new MappedGate(gate, this.handlers[gate.controllerId]));
					break;
				case "pt100":
					this.gates.push(new PT100Gate(gate, this.handlers[gate.controllerId]));
					break;
				case "default":
					this.gates.push(new IOGate(gate, this.handlers[gate.controllerId]) as IOGatesHydrated);
					break;
			}
		}

		this.startIOScanner();
	}

	/**
	 * Starts The IO Scanner,
	 * Scans the inputs to find their data from the Physical controllers
	 */
	public startIOScanner() {
		if (!this.timer) {
			TurbineEventLoop.emit("log", "info", `IOScanner: Started with interval ${this.ioScannerInterval}ms`);

			this.timer = setInterval(async () => {
				for (const g of this.gates.filter((g) => g.bus == "in")) {
					await g.read();
				}

				// Change detection: only emit ws.dirty if any input gate value changed
				let changed = false;
				for (const g of this.gates.filter((g) => g.bus === "in")) {
					if (this.previousValues.get(g.name) !== g.value) {
						changed = true;
						this.previousValues.set(g.name, g.value);
					}
				}
				if (changed) {
					TurbineEventLoop.emit("ws.dirty", "io");
				}
			}, this.ioScannerInterval);
		}
	}

	public stopIOScanner() {
		if (this.timer) clearInterval(this.timer);
	}

	// --- IOBus interface implementation ---

	async write(gateName: string, value: number, lock?: boolean): Promise<void> {
		const gate = this.gates.find((g) => g.name === gateName);
		if (!gate) throw new Error(`IOBus: Gate "${gateName}" not found`);

		if (lock !== undefined) {
			gate.locked = lock;
		}

		await gate.write(value);
	}

	snapshot(): Record<string, number> {
		return this.gates
			.filter((g) => g.bus === "out" && !g.locked)
			.reduce(
				(acc, gate) => {
					acc[gate.name] = gate.value;
					return acc;
				},
				{} as Record<string, number>,
			);
	}

	async resetAll(): Promise<void> {
		for (const gate of this.gates.filter((g) => g.bus === "out")) {
			await gate.write(gate.default);
		}
	}

	getGateValue(gateName: string): number | undefined {
		return this.gates.find((g) => g.name === gateName)?.value;
	}

	on(event: `updated.${string}`, listener: (gate: IOGateJSON) => void): void {
		const ioEvent = event.replace("updated.", "io.updated.") as `io.updated.${string}`;
		TurbineEventLoop.on(ioEvent, listener);
	}

	off(event: `updated.${string}`, listener: (gate: IOGateJSON) => void): void {
		const ioEvent = event.replace("updated.", "io.updated.") as `io.updated.${string}`;
		TurbineEventLoop.removeListener(ioEvent, listener);
	}

	/**
	 * Return the data towards the socket
	 */
	public get socketData(): IOGatesHydrated[] {
		return this.gates;
	}
}
