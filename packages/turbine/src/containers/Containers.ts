import type { ContainerHydrated, ContainerProductData, ContainerSensorHydrated } from "$types/hydrated/containers";
import type { IOGateJSON } from "$types/hydrated/io";
import type { Container as ContainerConfig, ContainerProduct } from "$types/spec/containers";
import type { CallToAction } from "$types/spec/nuster";
import { prisma } from "../db";
import { TurbineEventLoop } from "../events";
import { ContainerRegulation } from "./container-regulation";

export class Container implements ContainerConfig {
	name: string;
	type: string;

	sensors?: ContainerSensorHydrated[];
	regulations?: ContainerRegulation[];

	callToAction: CallToAction[];

	productData?: ContainerProductData;

	supportedProductSeries?: string[];

	#products: Record<string, ContainerProduct>;

	// Stored listener references for cleanup in dispose()
	private _on_unload!: () => void;
	private _on_load!: (product_series: string) => void;
	private _on_read!: (options: { callback?: (container: ContainerHydrated) => void | Promise<void> }) => void;
	private _sensor_handlers: Array<{ event: string; handler: (gate: IOGateJSON) => void }> = [];

	constructor(container: ContainerConfig, products: Record<string, ContainerProduct>) {
		// Load products
		this.#products = products;

		this.name = container.name;
		this.type = container.type;

		//optionals
		this.supportedProductSeries = container.supportedProductSeries;
		this.sensors = container.sensors;
		this.regulations = container.regulations?.map((r) => new ContainerRegulation(this, r));

		this.callToAction = container.callToAction ?? [];

		this._on_unload = this.unload_product.bind(this);
		TurbineEventLoop.on(`container.unload.${this.name}`, this._on_unload);

		this._on_load = (product_series) => {
			this.load_product(product_series);
		};
		TurbineEventLoop.on(`container.load.${this.name}`, this._on_load);

		this._on_read = async (options) => {
			options.callback?.(await this.socket_data());
		};
		TurbineEventLoop.on(`container.read.${this.name}`, this._on_read);

		for (const sensor of this.sensors ?? []) {
			const handler = async (gate: IOGateJSON) => {
				if (sensor.logic == "level-min" && gate.value == 0 && (await this.is_product_loaded()) == true) this.unload_product();
			};
			this._sensor_handlers.push({ event: `io.updated.${sensor.io}`, handler });
			TurbineEventLoop.on(`io.updated.${sensor.io}`, handler);
		}
	}

	/**
	 * Load product in
	 * @param product_series
	 * @returns
	 */
	async load_product(product_series: string): Promise<boolean> {
		if (this.supportedProductSeries === undefined) {
			TurbineEventLoop.emit("log", "error", `Container: ${this.name} is not loadable.`);
			return false;
		}

		const container = await prisma.container.findUnique({ where: { name: this.name } });

		if (container === null) {
			TurbineEventLoop.emit("log", "info", `Container: ${this.name} was not found in database.`);

			await prisma.container.create({
				data: {
					name: this.name,
					loadedProductType: product_series,
					loadDate: new Date().toISOString(),
				},
			});

			this.socket_data()
				.then((data) => {
					TurbineEventLoop.emit(`container.updated.${this.name}`, data);
					TurbineEventLoop.emit("ws.dirty", "containers");
				})
				.catch((err) => {
					TurbineEventLoop.emit("log", "error", `Container-${this.name}: socket_data failed: ${(err as Error).message}`);
				});

			return true;
		} else {
			await prisma.container.update({
				where: { name: this.name },
				data: {
					loadedProductType: product_series,
					loadDate: new Date().toISOString(),
				},
			});

			this.socket_data()
				.then((data) => {
					TurbineEventLoop.emit(`container.updated.${this.name}`, data);
					TurbineEventLoop.emit("ws.dirty", "containers");
				})
				.catch((err) => {
					TurbineEventLoop.emit("log", "error", `Container-${this.name}: socket_data failed: ${(err as Error).message}`);
				});
			return true;
		}
	}

	async unload_product() {
		const container = await prisma.container.findUnique({ where: { name: this.name } });

		if (container) {
			try {
				await prisma.container.delete({ where: { name: this.name } });
			} catch (ex) {
				TurbineEventLoop.emit("log", "error", `Container: ${this.name} was not found in database and then not deleted.`);
			}
		}

		this.socket_data()
			.then((data) => {
				TurbineEventLoop.emit(`container.updated.${this.name}`, data);
				TurbineEventLoop.emit("ws.dirty", "containers");
			})
			.catch((err) => {
				TurbineEventLoop.emit("log", "error", `Container-${this.name}: socket_data failed: ${(err as Error).message}`);
			});

		return true;
	}

	async fetch_slot_data() {
		const container_document = await prisma.container.findUnique({ where: { name: this.name } });

		if (container_document && this.isProductable) {
			const product_life_span = this.#products[container_document.loadedProductType]?.lifespan ?? -1;
			const limit_time = new Date(container_document.loadDate).getTime() + 1000 * 60 * 60 * 24 * product_life_span;

			let lifetimeRemaining = limit_time - Date.now();
			lifetimeRemaining = lifetimeRemaining < 0 ? 0 : lifetimeRemaining;

			this.productData = {
				loadedProductType: container_document.loadedProductType,
				loadDate: new Date(container_document.loadDate).toString(),
				lifetimeRemaining: product_life_span !== -1 ? lifetimeRemaining : -1,
			};
		} else {
			this.productData = undefined;
		}
	}

	async is_product_loaded(): Promise<boolean> {
		const container = await prisma.container.findUnique({ where: { name: this.name } });
		return container !== null;
	}

	get isProductable(): boolean {
		return this.supportedProductSeries !== undefined;
	}

	async socket_data(): Promise<ContainerHydrated> {
		await this.fetch_slot_data();
		return { ...this, isProductable: this.isProductable } as ContainerHydrated;
	}

	dispose(): void {
		TurbineEventLoop.removeListener(`container.unload.${this.name}`, this._on_unload);
		TurbineEventLoop.removeListener(`container.load.${this.name}`, this._on_load);
		TurbineEventLoop.removeListener(`container.read.${this.name}`, this._on_read);

		for (const { event, handler } of this._sensor_handlers) {
			TurbineEventLoop.removeListener(event, handler);
		}
		this._sensor_handlers = [];

		for (const regulation of this.regulations ?? []) {
			regulation.dispose();
		}
	}
}
