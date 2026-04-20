import type { StringParameterBlockHydrated } from "$types/hydrated/cycle/blocks/parameter-block-hydrated";
import type { AllParameterBlocks, IOReadParameterBlock as IOReadParameterBlockSpec } from "$types/spec/cycle/parameter";
import type { PBRContext } from "../../../services/pbr-context";
import { NumericParameterBlock } from "../numeric-parameter-block";
import { ParameterBlockRegistry } from "../parameter-block-registry";

export class IOReadParameterBlock extends NumericParameterBlock {
	private gateName: StringParameterBlockHydrated;
	private ctx: PBRContext;
	#gateValue = 0;
	private _on_gate_update: (gate: { value: number }) => void;

	constructor(obj: IOReadParameterBlockSpec, ctx: PBRContext) {
		super(obj);
		this.ctx = ctx;
		this.gateName = ParameterBlockRegistry.String(obj.io_read);

		this._on_gate_update = (gate: { value: number }) => {
			this.#gateValue = gate.value;
		};

		this.ctx.io.on(`updated.${this.gateName.data}`, this._on_gate_update);
	}

	public get data(): number {
		return this.#gateValue;
	}

	dispose(): void {
		this.ctx.io.off(`updated.${this.gateName.data}`, this._on_gate_update);
	}

	static is_io_read_pb(obj: AllParameterBlocks): obj is IOReadParameterBlockSpec {
		return (obj as IOReadParameterBlockSpec).io_read !== undefined;
	}
}
