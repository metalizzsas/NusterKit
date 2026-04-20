import { Container } from "../containers/containers";
import { TurbineEventLoop } from "../events";
import type { ContainerBus } from "../services/interfaces";
import type { ContainerHydrated } from "../types/hydrated/containers";
import type { Container as ContainerConfig, ContainerProduct } from "../types/spec/containers";

export class ContainersRouter implements ContainerBus {
	containers: Container[] = [];

	constructor(containers: ContainerConfig[], products: Record<string, ContainerProduct>) {
		this.containers = containers.map((c) => new Container(c, products));
	}

	async socket_data(): Promise<ContainerHydrated[]> {
		return await Promise.all(this.containers.map(async (k) => await k.socket_data()));
	}

	// --- ContainerBus interface implementation ---

	private find_container(name: string): Container {
		const c = this.containers.find((c) => c.name === name);
		if (!c) throw new Error(`ContainerBus: Container "${name}" not found`);
		return c;
	}

	private find_regulation(container_name: string, regulation_name: string) {
		const container = this.find_container(container_name);
		const reg = container.regulations?.find((r) => r.name === regulation_name);
		if (!reg) throw new Error(`ContainerBus: Regulation "${regulation_name}" not found in container "${container_name}"`);
		return reg;
	}

	async load(container_name: string, product_series: string): Promise<void> {
		const container = this.find_container(container_name);
		await container.load_product(product_series);
	}

	async unload(container_name: string): Promise<void> {
		const container = this.find_container(container_name);
		await container.unload_product();
	}

	async read(container_name: string): Promise<ContainerHydrated> {
		const container = this.find_container(container_name);
		return await container.socket_data();
	}

	get_regulation_state(container_name: string, regulation_name: string): boolean {
		return this.find_regulation(container_name, regulation_name).state;
	}

	async set_regulation_state(container_name: string, regulation_name: string, state: boolean): Promise<boolean> {
		const reg = this.find_regulation(container_name, regulation_name);
		reg.state = state;
		if (!state) {
			reg["setActuators"]("plus", false);
			reg["setActuators"]("minus", false);
			reg["setActuators"]("active", false);
		}
		TurbineEventLoop.emit(`container.${container_name}.regulation.${regulation_name}.state_updated`, reg.state);
		TurbineEventLoop.emit("ws.dirty", "containers");
		return reg.state;
	}

	get_regulation_target(container_name: string, regulation_name: string): number {
		return this.find_regulation(container_name, regulation_name).target;
	}

	async set_regulation_target(container_name: string, regulation_name: string, target: number): Promise<number> {
		const reg = this.find_regulation(container_name, regulation_name);
		reg.target = Math.min(target, reg.maxTarget);
		TurbineEventLoop.emit(`container.${container_name}.regulation.${regulation_name}.target_updated`, reg.target);
		TurbineEventLoop.emit("ws.dirty", "containers");
		return reg.target;
	}

	on(event: string, listener: (...args: never[]) => void): void {
		if (event.startsWith("updated.")) {
			const container_name = event.replace("updated.", "");
			TurbineEventLoop.on(`container.updated.${container_name}`, listener as (c: ContainerHydrated) => void);
		} else if (event.includes(".state_updated")) {
			const key = event.replace(".state_updated", "");
			TurbineEventLoop.on(
				`container.${key}.state_updated` as `container.${string}.regulation.${string}.state_updated`,
				listener as (s: boolean) => void,
			);
		} else if (event.includes(".target_updated")) {
			const key = event.replace(".target_updated", "");
			TurbineEventLoop.on(
				`container.${key}.target_updated` as `container.${string}.regulation.${string}.target_updated`,
				listener as (t: number) => void,
			);
		}
	}

	off(event: string, listener: (...args: never[]) => void): void {
		if (event.startsWith("updated.")) {
			const container_name = event.replace("updated.", "");
			TurbineEventLoop.removeListener(`container.updated.${container_name}`, listener as (c: ContainerHydrated) => void);
		} else if (event.includes(".state_updated")) {
			const key = event.replace(".state_updated", "");
			TurbineEventLoop.removeListener(
				`container.${key}.state_updated` as `container.${string}.regulation.${string}.state_updated`,
				listener as (s: boolean) => void,
			);
		} else if (event.includes(".target_updated")) {
			const key = event.replace(".target_updated", "");
			TurbineEventLoop.removeListener(
				`container.${key}.target_updated` as `container.${string}.regulation.${string}.target_updated`,
				listener as (t: number) => void,
			);
		}
	}
}
