import type { ContainerHydrated } from "$types/hydrated/containers";
import type { StringParameterBlockHydrated } from "$types/hydrated/cycle/blocks/parameter-block-hydrated";
import type { AllParameterBlocks, ProductStatusParameterBlock as ProductStatusParameterBlockSpec } from "$types/spec/cycle/parameter";
import type { PBRContext } from "../../../services/pbr-context";
import { ParameterBlockRegistry } from "../parameter-block-registry";
import { StatusParameterBlock } from "../status-parameter-block";

const RETRY_BASE_MS = 1_000;
const RETRY_MAX_MS = 30_000;

/** Slot status should be only used for security conditions */
export class ProductStatusParameterBlock extends StatusParameterBlock {
	private container_name: StringParameterBlockHydrated;
	private ctx: PBRContext;
	#container?: ContainerHydrated;

	#on_updated: (container: ContainerHydrated) => void;
	#retry_timer?: ReturnType<typeof setTimeout>;
	#read_attempts = 0;
	#disposed = false;

	constructor(obj: ProductStatusParameterBlockSpec, ctx: PBRContext) {
		super(obj);
		this.ctx = ctx;
		this.container_name = ParameterBlockRegistry.String(obj.product_status);

		this.#on_updated = (container) => {
			this.#container = container;
			this.subscriber?.(this.data);
		};
		this.ctx.containers.on(`updated.${this.container_name.data}`, this.#on_updated);

		this.read_container();
	}

	/**
	 * Lecture initiale du bac.
	 *
	 * Elle est asynchrone, et le bloc ne réagit ensuite qu'aux événements
	 * `container.updated` — émis au chargement ou au vidage d'un bac, et à rien
	 * d'autre. Si cette première lecture échouait (base occupée au démarrage, par
	 * exemple), le bac restait inconnu, la condition restait à `"error"`, et rien ne
	 * la remettait à jour tant que personne ne touchait à ce bac. C'était le
	 * « parfois réactif, parfois non ». On réessaie donc jusqu'à y arriver.
	 */
	private read_container(): void {
		this.ctx.containers
			.read(this.container_name.data)
			.then((container) => {
				if (this.#disposed) return;
				this.#read_attempts = 0;
				this.#container = container;
				this.subscriber?.(this.data);
			})
			.catch((err) => {
				if (this.#disposed) return;
				const delay = Math.min(RETRY_BASE_MS * 2 ** this.#read_attempts++, RETRY_MAX_MS);
				this.ctx.logger.log(
					"warning",
					`ProductStatusPB: Failed to read container "${this.container_name.data}", retrying in ${delay}ms: ${(err as Error).message}`,
				);
				this.#retry_timer = setTimeout(() => this.read_container(), delay);
			});
	}

	public get data(): "error" | "warning" | "good" {
		if (this.#container === undefined) return "error";

		if (this.#container.productData === undefined) return "error";

		if (this.#container.productData?.lifetimeRemaining === undefined) return "error";

		if (this.#container.productData?.lifetimeRemaining < 1) return "warning";

		return "good";
	}

	override dispose(): void {
		this.#disposed = true;
		if (this.#retry_timer) clearTimeout(this.#retry_timer);
		this.ctx.containers.off(`updated.${this.container_name.data}`, this.#on_updated);
	}

	static is_product_status_pb(obj: AllParameterBlocks): obj is ProductStatusParameterBlockSpec {
		return (obj as ProductStatusParameterBlockSpec).product_status !== undefined;
	}
}
