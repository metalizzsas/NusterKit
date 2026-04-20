import type { StringParameterBlockHydrated } from "$types/hydrated/cycle/blocks/ParameterBlockHydrated";
import type { AllParameterBlocks, ProfileParameterBlock as ProfileParameterBlockSpec } from "$types/spec/cycle/parameter";
import type { ProfileHydrated } from "$types/hydrated/profiles";
import type { ProfileSkeleton } from "$types/spec/profiles";
import type { PBRContext } from "../../../services/PBRContext";
import { ParameterBlockRegistry } from "../ParameterBlockRegistry";
import { NumericParameterBlock } from "../NumericParameterBlock";

export class ProfileParameterBlock extends NumericParameterBlock {
	private profileRow: StringParameterBlockHydrated;
	private ctx: PBRContext;

	#profile?: ProfileHydrated;
	#profileSkeleton?: ProfileSkeleton;

	constructor(obj: ProfileParameterBlockSpec, ctx: PBRContext) {
		super(obj);
		this.ctx = ctx;
		this.profileRow = ParameterBlockRegistry.String(obj.profile);

		this.#profile = this.ctx.readProfile();
		this.#profileSkeleton = this.ctx.machine.getConfig().profileSkeletons.find(p => p.name === this.#profile?.skeleton);
	}

	public get data(): number {
		const profileRowData = this.profileRow.data;

		if (this.#profile === undefined || this.#profileSkeleton === undefined) {
			this.ctx.logger.log("warning", "Profile: profile not defined, returning 0");
			return 0;
		}

		const val = this.#profile.values.find(v => v.name == profileRowData);
		const profileSkeletonRow = this.#profileSkeleton.fields.find(r => r.name === profileRowData);

		if (val === undefined || profileSkeletonRow === undefined) {
			this.ctx.logger.log("warning", `Profile: profile row ${profileRowData} not defined returning 0`);
			return 0;
		}

		if (profileSkeletonRow.type === "incremental")
			return profileSkeletonRow.baseValue + val.value;

		if (typeof val === "boolean")
			return val ? 1 : 0;

		return val.value;
	}

	static isProfilePB(obj: AllParameterBlocks): obj is ProfileParameterBlockSpec {
		return (obj as ProfileParameterBlockSpec).profile !== undefined;
	}
}
