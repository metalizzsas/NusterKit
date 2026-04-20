import type {
	NumericParameterBlockHydrated,
	StatusParameterBlockHydrated,
	StringParameterBlockHydrated,
} from "$types/hydrated/cycle/blocks/parameter-block-hydrated";
import type { AllParameterBlocks, NumericParameterBlocks, StatusParameterBlocks, StringParameterBlocks } from "$types/spec/cycle/parameter";
import type { PBRContext } from "../../services/pbr-context";
import { GetRegulationStateParameterBlock } from "./machine/get-regulation-state-parameter-block";
import { IOReadParameterBlock } from "./machine/io-read-parameter-block";
import { MaintenanceStatusParameterBlock } from "./machine/maintenance-status-parameter-block";
import { ProductStatusParameterBlock } from "./machine/product-status-parameter-block";
import { ProfileParameterBlock } from "./machine/profile-parameter-block";
import { AddParameterBlock } from "./math/add-parameter-block";
import { ConditionalParameterBlock } from "./math/conditional-parameter-block";
import { DivideParameterBlock } from "./math/divide-parameter-block";
import { MultiplyParameterBlock } from "./math/multiply-parameter-block";
import { ReverseParameterBlock } from "./math/reverse-parameter-block";
import { SubParameterBlock } from "./math/sub-parameter-block";
import type { NumericParameterBlock } from "./numeric-parameter-block";
import type { StatusParameterBlock } from "./status-parameter-block";
import type { StringParameterBlock as StringParameterBlockType } from "./string-parameter-block";
import { NumberParameterBlock } from "./var/number-parameter-block";
import { ReadMachineVariableParameterBlock } from "./var/read-machine-variable-block";
import { ReadVariableParameterBlock } from "./var/read-variable-parameter-block";
import { StringParameterBlock } from "./var/string-parameter-block";

/**
 * Parameter Block Registry
 * @desc Creates parameter blocks from their non hydrated form
 */
export class ParameterBlockRegistry {
	/**
	 * Creates numeric parameters blocks
	 * @param obj non hydrated source object
	 * @returns Numeric parameter block hydrated
	 */
	static Numeric(obj: NumericParameterBlocks, ctx?: PBRContext): NumericParameterBlock {
		if (typeof obj === "number") return new NumberParameterBlock({ number: obj });
		if (NumberParameterBlock.is_number_pb(obj)) return new NumberParameterBlock(obj);

		if (ReadVariableParameterBlock.is_read_variable_pb(obj)) return new ReadVariableParameterBlock(obj, ctx!);

		if (AddParameterBlock.is_add_pb(obj)) return new AddParameterBlock(obj);
		if (MultiplyParameterBlock.is_multiply_pb(obj)) return new MultiplyParameterBlock(obj);

		if (SubParameterBlock.is_sub_pb(obj)) return new SubParameterBlock(obj);
		if (DivideParameterBlock.is_divide_pb(obj)) return new DivideParameterBlock(obj);
		if (ReverseParameterBlock.is_reverse_pb(obj)) return new ReverseParameterBlock(obj);

		if (ProfileParameterBlock.is_profile_pb(obj)) return new ProfileParameterBlock(obj, ctx!);

		if (IOReadParameterBlock.is_io_read_pb(obj)) return new IOReadParameterBlock(obj, ctx!);

		if (ConditionalParameterBlock.is_conditional_pb(obj)) return new ConditionalParameterBlock(obj);

		if (ReadMachineVariableParameterBlock.is_read_machine_variable_pb(obj)) return new ReadMachineVariableParameterBlock(obj, ctx!);

		if (GetRegulationStateParameterBlock.is_get_regulation_state_pb(obj)) return new GetRegulationStateParameterBlock(obj, ctx!);

		throw Error("ParameterBlock data is not compatible with Numeric ParameterBlock");
	}

	/**
	 * Creates string parameters blocks
	 * @param obj Non hydrated source object
	 * @returns String parameter block hydrated
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	static String(obj: StringParameterBlocks, ctx?: PBRContext): StringParameterBlockType {
		if (typeof obj === "string") return new StringParameterBlock({ string: obj });
		if (StringParameterBlock.is_string_pb(obj)) return new StringParameterBlock(obj);

		throw Error("ParameterBlock data is not compatible with String ParameterBlock");
	}

	/**
	 * Creates status parameters blocks
	 * @param obj Non hydrated source objects
	 * @returns Status parameter block hydrated
	 */
	static Status(obj: StatusParameterBlocks, ctx?: PBRContext): StatusParameterBlock {
		if (MaintenanceStatusParameterBlock.is_maintenance_status_pb(obj)) return new MaintenanceStatusParameterBlock(obj, ctx!);
		if (ProductStatusParameterBlock.is_product_status_pb(obj)) return new ProductStatusParameterBlock(obj, ctx!);

		throw Error("ParameterBlock data is not compatible with Status ParameterBlock");
	}

	/** Tries to generate a program block that its type is unknown */
	static All(obj: AllParameterBlocks, ctx?: PBRContext): StringParameterBlockHydrated | StatusParameterBlockHydrated | NumericParameterBlockHydrated {
		// Primitive types
		if (typeof obj === "number") return ParameterBlockRegistry.Numeric(obj, ctx);
		if (typeof obj === "string") return ParameterBlockRegistry.String(obj, ctx);

		// Status blocks (check first — their keys don't overlap with numeric)
		if ("maintenance_status" in obj) return ParameterBlockRegistry.Status(obj as StatusParameterBlocks, ctx);
		if ("product_status" in obj) return ParameterBlockRegistry.Status(obj as StatusParameterBlocks, ctx);

		// String blocks
		if ("string" in obj) return ParameterBlockRegistry.String(obj as StringParameterBlocks, ctx);

		// Everything else is numeric
		return ParameterBlockRegistry.Numeric(obj as NumericParameterBlocks, ctx);
	}
}
