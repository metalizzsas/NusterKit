import type { ContainerHydrated } from "$types/hydrated/containers";
import type { StringParameterBlockHydrated } from "$types/hydrated/cycle/blocks/parameter-block-hydrated";
import type { AllParameterBlocks, ProductStatusParameterBlock as ProductStatusParameterBlockSpec } from "$types/spec/cycle/parameter";
import type { PBRContext } from "../../../services/pbr-context";
import { ParameterBlockRegistry } from "../parameter-block-registry";
import { StatusParameterBlock } from "../status-parameter-block";

/** Slot status should be only used for security conditions */
export class ProductStatusParameterBlock extends StatusParameterBlock {
	private containerName: StringParameterBlockHydrated;
	private ctx: PBRContext;
	#container?: ContainerHydrated;

	constructor(obj: ProductStatusParameterBlockSpec, ctx: PBRContext) {
		super(obj);
		this.ctx = ctx;
		this.containerName = ParameterBlockRegistry.String(obj.product_status);

		this.ctx.containers.on(`updated.${this.containerName.data}`, (container) => {
			this.#container = container;
			this.subscriber?.(this.data);
		});
		this.ctx.containers.read(this.containerName.data).then((container) => {
			this.#container = container;
			this.subscriber?.(this.data);
		}).catch(err => {
			this.ctx.logger.log("error", `ProductStatusPB: Failed to read container "${this.containerName.data}": ${(err as Error).message}`);
		});
	}

	public get data(): "error" | "warning" | "good" {
		if (this.#container === undefined)
			return "error";

		if (this.#container.productData === undefined)
			return "error";

		if (this.#container.productData?.lifetimeRemaining === undefined)
			return "error";

		if (this.#container.productData?.lifetimeRemaining < 1)
			return "warning";

		return "good";
	}

	static isProductStatusPB(obj: AllParameterBlocks): obj is ProductStatusParameterBlockSpec {
		return (obj as ProductStatusParameterBlockSpec).product_status !== undefined;
	}
}
