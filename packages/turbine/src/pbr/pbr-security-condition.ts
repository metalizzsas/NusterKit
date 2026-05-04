import type { NumericParameterBlockHydrated, StatusParameterBlockHydrated } from "$types/hydrated/cycle/blocks/parameter-block-hydrated";
import type { PBRMode } from "$types/hydrated/cycle/program-block-runner-hydrated";
import type { IOGateJSON } from "$types/hydrated/io";
import type { PBRRunCondition as PBRRunConditionConfig, PBRStartConditionResult } from "$types/spec/cycle/pbr-run-condition";
import { TurbineEventLoop } from "../events";
import type { PBRContext } from "../services/pbr-context";
import { ParameterBlockRegistry } from "./parameter-blocks/parameter-block-registry";

export class PBRRunCondition {
	name: string;
	startOnly: boolean;

	disabled_flag = false;

	disabled: NumericParameterBlockHydrated | undefined;
	scc: PBRRunConditionConfig;

	#state: PBRStartConditionResult = "error";
	get state(): PBRStartConditionResult {
		return this.#state;
	}
	set state(value: PBRStartConditionResult) {
		if (this.#state === value) return;
		this.#state = value;
		TurbineEventLoop.emit("ws.dirty", "cycle");
	}

	#statusBlock: StatusParameterBlockHydrated | undefined;
	#pbrState: PBRMode = "creating";

	#gateListenerReference: typeof this.gate_listener | undefined = undefined;
	#pbrStateListenerReference: ((state: PBRMode) => void) | undefined = undefined;

	subscriber: ((data: { name: string; startOnly: boolean; result: PBRStartConditionResult }) => void) | undefined = undefined;

	private ctx: PBRContext;

	constructor(
		pbrsc: PBRRunConditionConfig,
		subscribe_callback?: (data: { name: string; startOnly: boolean; result: PBRStartConditionResult }) => void,
		ctx?: PBRContext,
	) {
		this.name = pbrsc.name;
		this.startOnly = pbrsc.startOnly;
		this.scc = pbrsc;
		this.ctx = ctx!;

		this.subscriber = subscribe_callback;

		if (pbrsc.disabled) this.disabled = ParameterBlockRegistry.Numeric(pbrsc.disabled, ctx);

		this.#pbrStateListenerReference = (state: PBRMode) => {
			this.#pbrState = state;
		};
		this.ctx.pbr_emitter.on("status.update", this.#pbrStateListenerReference);

		if (this.disabled?.data === 1) {
			this.state = "disabled";
			return;
		}

		if (pbrsc.checkchain.io !== undefined) {
			this.#gateListenerReference = this.gate_listener.bind(this);
			this.ctx.io.on(`updated.${pbrsc.checkchain.io.gateName}`, this.#gateListenerReference);
		}

		if (pbrsc.checkchain.parameter !== undefined) {
			this.#statusBlock = ParameterBlockRegistry.Status(pbrsc.checkchain.parameter, ctx);
			this.state = this.#statusBlock.data;

			this.#statusBlock.subscribe((data) => {
				if (this.disabled_flag === true) return;

				this.state = data;

				if (this.state === "error" && this.#pbrState === "started") this.subscriber?.(this.toJSON());
			});
		}
	}

	private gate_listener(gate: IOGateJSON) {
		if (this.disabled_flag === true) return;
		this.state = gate.value === this.scc.checkchain.io?.gateValue ? "good" : "error";

		if (this.state === "error" && this.#pbrState === "started") this.subscriber?.(this.toJSON());
	}

	public dispose() {
		if (this.#gateListenerReference && this.scc.checkchain.io) {
			this.ctx.io.off(`updated.${this.scc.checkchain.io.gateName}`, this.#gateListenerReference);
		}
		if (this.#pbrStateListenerReference) {
			this.ctx.pbr_emitter.off("status.update", this.#pbrStateListenerReference);
		}
		this.disabled_flag = true;
	}

	get canStart(): boolean {
		return this.state !== "error";
	}

	toJSON() {
		return {
			name: this.name,
			startOnly: this.startOnly,
			result: this.state,
		};
	}
}
