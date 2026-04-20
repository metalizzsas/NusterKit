import type { MachineSpecs } from "$types/index";

/**
 * Insert deeply on nested sub objects for the IMachineSpecs interface
 * @param obj IMachineSpecs specs
 * @param value Value added to IMachineSpecs spec
 * @param obj_path Path where the object should be added
 * @returns IMachineSpecs specs
 */
export function deep_insert(obj: MachineSpecs, value: unknown, obj_path: string, method: "replace" | "merge" | "set"): MachineSpecs {
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
	}
	return obj;
}
