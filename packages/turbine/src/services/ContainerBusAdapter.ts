import type { ContainerBus } from "./interfaces";
import type { Container } from "../containers/Containers";
import type { ContainerHydrated } from "$types/hydrated/containers";
import { TurbineEventLoop } from "../events";

/**
 * ContainerBus adapter — wraps Container instances and their ContainerRegulation
 * objects, providing direct method access instead of event-based communication.
 */
export class ContainerBusAdapter implements ContainerBus {
	private containers: Container[];

	constructor(containers: Container[]) {
		this.containers = containers;
	}

	private findContainer(name: string): Container {
		const c = this.containers.find(c => c.name === name);
		if (!c) throw new Error(`ContainerBus: Container "${name}" not found`);
		return c;
	}

	private findRegulation(containerName: string, regulationName: string) {
		const container = this.findContainer(containerName);
		const reg = container.regulations?.find(r => r.name === regulationName);
		if (!reg) throw new Error(`ContainerBus: Regulation "${regulationName}" not found in container "${containerName}"`);
		return reg;
	}

	async load(containerName: string, productSeries: string): Promise<void> {
		const container = this.findContainer(containerName);
		await container.loadProduct(productSeries);
	}

	async unload(containerName: string): Promise<void> {
		const container = this.findContainer(containerName);
		await container.unloadProduct();
	}

	async read(containerName: string): Promise<ContainerHydrated> {
		const container = this.findContainer(containerName);
		return await container.socketData();
	}

	getRegulationState(containerName: string, regulationName: string): boolean {
		return this.findRegulation(containerName, regulationName).state;
	}

	async setRegulationState(containerName: string, regulationName: string, state: boolean): Promise<boolean> {
		const reg = this.findRegulation(containerName, regulationName);
		reg.state = state;
		if (!state) {
			reg["setActuators"]("plus", false);
			reg["setActuators"]("minus", false);
			reg["setActuators"]("active", false);
		}
		TurbineEventLoop.emit(`container.${containerName}.regulation.${regulationName}.state_updated`, reg.state);
		TurbineEventLoop.emit("ws.dirty", "containers");
		return reg.state;
	}

	getRegulationTarget(containerName: string, regulationName: string): number {
		return this.findRegulation(containerName, regulationName).target;
	}

	async setRegulationTarget(containerName: string, regulationName: string, target: number): Promise<number> {
		const reg = this.findRegulation(containerName, regulationName);
		reg.target = Math.min(target, reg.maxTarget);
		TurbineEventLoop.emit(`container.${containerName}.regulation.${regulationName}.target_updated`, reg.target);
		TurbineEventLoop.emit("ws.dirty", "containers");
		return reg.target;
	}

	// Transition bridge: wraps TurbineEventLoop for fan-out subscriptions
	on(event: string, listener: (...args: never[]) => void): void {
		if (event.startsWith("updated.")) {
			const containerName = event.replace("updated.", "");
			TurbineEventLoop.on(`container.updated.${containerName}`, listener as (c: ContainerHydrated) => void);
		} else if (event.includes(".state_updated")) {
			const key = event.replace(".state_updated", "");
			TurbineEventLoop.on(`container.${key}.state_updated` as `container.${string}.regulation.${string}.state_updated`, listener as (s: boolean) => void);
		} else if (event.includes(".target_updated")) {
			const key = event.replace(".target_updated", "");
			TurbineEventLoop.on(`container.${key}.target_updated` as `container.${string}.regulation.${string}.target_updated`, listener as (t: number) => void);
		}
	}

	off(event: string, listener: (...args: never[]) => void): void {
		if (event.startsWith("updated.")) {
			const containerName = event.replace("updated.", "");
			TurbineEventLoop.removeListener(`container.updated.${containerName}`, listener as (c: ContainerHydrated) => void);
		} else if (event.includes(".state_updated")) {
			const key = event.replace(".state_updated", "");
			TurbineEventLoop.removeListener(`container.${key}.state_updated` as `container.${string}.regulation.${string}.state_updated`, listener as (s: boolean) => void);
		} else if (event.includes(".target_updated")) {
			const key = event.replace(".target_updated", "");
			TurbineEventLoop.removeListener(`container.${key}.target_updated` as `container.${string}.regulation.${string}.target_updated`, listener as (t: number) => void);
		}
	}
}
