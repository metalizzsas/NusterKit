import type { ContainerHydrated, ContainerProductData, ContainerSensorHydrated } from "$types/hydrated/containers";
import type { IOGateJSON } from "$types/hydrated/io";
import type { Container as ContainerConfig, ContainerProduct } from "$types/spec/containers";
import type { CallToAction } from "$types/spec/nuster";
import { prisma } from "../db";
import { TurbineEventLoop } from "../events";
import { ContainerRegulation } from "./container-regulation";

/** Ligne persistée d'un bac, telle qu'on la garde en mémoire. */
type ProductDocument = { loadedProductType: string; loadDate: Date };

/** Lecture groupée en cours, partagée par tous les bacs. */
let pending_batch: Promise<Map<string, ProductDocument>> | undefined;

/**
 * Lit la table des bacs en UNE requête, partagée par toutes les instances.
 *
 * Une `findUnique` par bac faisait cinq requêtes simultanées sur
 * `metalfog-m-2`, toutes déclenchées par le premier statut complet. Prisma sur
 * SQLite les sérialise sur une connexion unique, et au démarrage — disque
 * encore pris, clients qui se connectent ensemble — les dernières de la file
 * atteignaient le `Socket timeout` avant d'être servies. Mettre le résultat en
 * cache ne suffisait pas : ça supprimait les requêtes du régime établi, pas la
 * rafale du démarrage, qui est exactement le moment qui pose problème.
 */
function load_all_products(): Promise<Map<string, ProductDocument>> {
	pending_batch ??= prisma.container
		.findMany()
		.then((rows) => new Map(rows.map((row) => [row.name, { loadedProductType: row.loadedProductType, loadDate: row.loadDate }])))
		.finally(() => {
			// Libérée dès qu'elle est retombée : un échec doit pouvoir être rejoué,
			// et les écritures alimentent le cache sans repasser par ici.
			pending_batch = undefined;
		});

	return pending_batch;
}

export class Container implements ContainerConfig {
	name: string;
	type: string;

	sensors?: ContainerSensorHydrated[];
	regulations?: ContainerRegulation[];

	callToAction: CallToAction[];

	productData?: ContainerProductData;

	supportedProductSeries?: string[];

	#products: Record<string, ContainerProduct>;

	/**
	 * En mémoire, la ligne persistée du bac — `null` quand aucun produit n'est
	 * chargé, `undefined` tant qu'elle n'a pas été lue. Ce que la base contient
	 * ne bouge qu'au chargement ou au déchargement ; rien ne justifie de la
	 * relire au rythme du WebSocket, où une requête par bac et par diffusion
	 * finissait par saturer l'unique connexion SQLite.
	 */
	#product_document?: ProductDocument | null;
	/** Lecture en cours, partagée pour que N appels simultanés ne fassent qu'une requête */
	#hydration?: Promise<void>;

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
	 * Lit la ligne persistée si elle ne l'est pas encore.
	 * Les appels concurrents partagent la même requête.
	 */
	async #hydrate(): Promise<void> {
		if (this.#product_document !== undefined) return;

		this.#hydration ??= load_all_products()
			.then((rows) => {
				this.#product_document = rows.get(this.name) ?? null;
			})
			.finally(() => {
				this.#hydration = undefined;
			});

		await this.#hydration;
	}

	/** Signale aux clients que le contenu du bac a changé */
	#emit_update(): void {
		this.socket_data()
			.then((data) => {
				TurbineEventLoop.emit(`container.updated.${this.name}`, data);
				TurbineEventLoop.emit("ws.dirty", "containers");
			})
			.catch((err) => {
				TurbineEventLoop.emit("log", "error", `Container-${this.name}: socket_data failed: ${(err as Error).message}`);
			});
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

		await this.#hydrate();

		const load_date = new Date();

		if (this.#product_document === null) {
			TurbineEventLoop.emit("log", "info", `Container: ${this.name} was not found in database.`);

			await prisma.container.create({
				data: {
					name: this.name,
					loadedProductType: product_series,
					loadDate: load_date.toISOString(),
				},
			});
		} else {
			await prisma.container.update({
				where: { name: this.name },
				data: {
					loadedProductType: product_series,
					loadDate: load_date.toISOString(),
				},
			});
		}

		this.#product_document = { loadedProductType: product_series, loadDate: load_date };
		this.#emit_update();

		return true;
	}

	async unload_product() {
		await this.#hydrate();

		if (this.#product_document !== null) {
			try {
				await prisma.container.delete({ where: { name: this.name } });
			} catch (ex) {
				TurbineEventLoop.emit("log", "error", `Container: ${this.name} was not found in database and then not deleted.`);
			}
		}

		this.#product_document = null;
		this.#emit_update();

		return true;
	}

	async fetch_slot_data() {
		await this.#hydrate();

		const container_document = this.#product_document;

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
		await this.#hydrate();
		return this.#product_document !== null;
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
