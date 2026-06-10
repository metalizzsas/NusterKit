import type { MachineSpecs } from "$types/index";

/**
 * Check whether an array item matches a removal criterion (recursive, partial).
 *
 * - Primitives match by strict equality.
 * - Objects match when every field listed in the criterion matches the item
 *   (extra item fields are ignored).
 * - Arrays match as a prefix: every listed element must match the item at the
 *   same index, so `["regulators#rd-pressure"]` matches both
 *   `["regulators#rd-pressure", 0]` and `["regulators#rd-pressure", { ... }]`.
 */
function matches_criterion(item: unknown, criterion: unknown): boolean {
	if (criterion === null || typeof criterion !== "object") return item === criterion;
	if (item === null || typeof item !== "object") return false;

	if (Array.isArray(criterion)) {
		if (!Array.isArray(item)) return false;
		return criterion.every((sub, index) => matches_criterion((item as Array<unknown>)[index], sub));
	}

	return Object.entries(criterion as Record<string, unknown>).every(([key, val]) => matches_criterion((item as Record<string, unknown>)[key], val));
}

/**
 * Insert deeply on nested sub objects for the IMachineSpecs interface
 * @param obj IMachineSpecs specs
 * @param value Value added to IMachineSpecs spec
 * @param obj_path Path where the object should be added
 * @returns IMachineSpecs specs
 */
export function deep_insert(obj: MachineSpecs, value: unknown, obj_path: string, method: "replace" | "merge" | "set" | "remove"): MachineSpecs {
	let index;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let temp_obj: MachineSpecs | any = obj;

	const path = obj_path.split(".");

	for (index = 0; index < path.length - 1; index++) {
		temp_obj = temp_obj[path[index]];
	}

	if (method == "replace") {
		//If the last path has an index, it will add himself after this index
		if (!isNaN(parseInt(path[index])))
			if (Array.isArray(value)) temp_obj.splice(path[index], value.length, ...value);
			else temp_obj.splice(path[index], 1, value);
		else temp_obj[path[index]] = value;
	} else if (method == "set") {
		temp_obj[path[index]] = value;
	} else if (method == "merge") {
		//If the last path has an index, it will add himself after this index
		if (!isNaN(parseInt(path[index])))
			if (Array.isArray(value)) temp_obj.splice(path[index], 0, ...value);
			else temp_obj.splice(path[index], 0, value);
		else if (Array.isArray(value)) temp_obj[path[index]].push(...value);
		else {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			temp_obj[path[index]] = { ...temp_obj[path[index]], ...(value as any) };
		}
	} else if (method == "remove") {
		const target = temp_obj[path[index]];

		// When the path points to an array, `value` is a list of match
		// criteria: every item matching at least one criterion is removed.
		if (Array.isArray(target)) {
			const criteria = (Array.isArray(value) ? value : [value]) as Array<unknown>;
			temp_obj[path[index]] = target.filter((item) => !criteria.some((criterion) => matches_criterion(item, criterion)));
		}
		// When the path points to an object, `value` is a list of property
		// keys to delete from it.
		else if (target !== null && typeof target === "object") {
			const keys = (Array.isArray(value) ? value : [value]) as Array<string>;
			for (const key of keys) delete target[key];
		}
	}
	return obj;
}
