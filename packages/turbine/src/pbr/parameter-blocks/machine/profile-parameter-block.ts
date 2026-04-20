import type { StringParameterBlockHydrated } from "$types/hydrated/cycle/blocks/parameter-block-hydrated";
import type { ProfileHydrated } from "$types/hydrated/profiles";
import type { AllParameterBlocks, ProfileParameterBlock as ProfileParameterBlockSpec } from "$types/spec/cycle/parameter";
import type { ProfileSkeleton } from "$types/spec/profiles";
import type { PBRContext } from "../../../services/pbr-context";
import { NumericParameterBlock } from "../numeric-parameter-block";
import { ParameterBlockRegistry } from "../parameter-block-registry";

export class ProfileParameterBlock extends NumericParameterBlock {
	private profile_row: StringParameterBlockHydrated;
	private ctx: PBRContext;

	#profile?: ProfileHydrated;
	#profile_skeleton?: ProfileSkeleton;

	constructor(obj: ProfileParameterBlockSpec, ctx: PBRContext) {
		super(obj);
		this.ctx = ctx;
		this.profile_row = ParameterBlockRegistry.String(obj.profile);

		this.#profile = this.ctx.read_profile();
		this.#profile_skeleton = this.ctx.machine.get_config().profileSkeletons.find((p) => p.name === this.#profile?.skeleton);
	}

	public get data(): number {
		const profile_row_data = this.profile_row.data;

		if (this.#profile === undefined || this.#profile_skeleton === undefined) {
			this.ctx.logger.log("warning", "Profile: profile not defined, returning 0");
			return 0;
		}

		const val = this.#profile.values.find((v) => v.name == profile_row_data);
		const profile_skeleton_row = this.#profile_skeleton.fields.find((r) => r.name === profile_row_data);

		if (val === undefined || profile_skeleton_row === undefined) {
			this.ctx.logger.log("warning", `Profile: profile row ${profile_row_data} not defined returning 0`);
			return 0;
		}

		if (profile_skeleton_row.type === "incremental") return profile_skeleton_row.baseValue + val.value;

		if (typeof val === "boolean") return val ? 1 : 0;

		return val.value;
	}

	static is_profile_pb(obj: AllParameterBlocks): obj is ProfileParameterBlockSpec {
		return (obj as ProfileParameterBlockSpec).profile !== undefined;
	}
}
