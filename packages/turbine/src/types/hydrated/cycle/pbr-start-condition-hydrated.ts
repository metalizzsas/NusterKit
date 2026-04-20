import type { PBRRunCondition, PBRStartConditionResult } from "../../spec/cycle/pbr-run-condition";
import type { Modify } from "../../utils";
import type { NumericParameterBlockHydrated, StatusParameterBlockHydrated } from "./blocks/parameter-block-hydrated";

export type PBRStartConditionHydrated = Modify<
	PBRRunCondition,
	{
		disabled?: NumericParameterBlockHydrated;
		checkchain: () => StatusParameterBlockHydrated["data"];
		result: PBRStartConditionResult;
	}
>;
