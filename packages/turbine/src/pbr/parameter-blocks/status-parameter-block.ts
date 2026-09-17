import type { StatusParameterBlocks } from "$types/spec/cycle/parameter";
import { ParameterBlock } from "./parameter-block";

export class StatusParameterBlock extends ParameterBlock<"error" | "warning" | "good"> {
	subscriber: ((data: "error" | "warning" | "good") => void) | undefined;

	constructor(obj: StatusParameterBlocks) {
		super(obj);
	}

	/** Subscribe to block data change */
	subscribe(callback: (data: "error" | "warning" | "good") => void) {
		this.subscriber = callback;
	}

	/**
	 * Libère ce que le bloc a pu enregistrer sur le bus d'événements. Les blocs
	 * qui s'abonnent à quelque chose le surchargent ; sans ça, chaque création de
	 * cycle laissait un écouteur de plus derrière elle.
	 */
	dispose(): void {}
}
