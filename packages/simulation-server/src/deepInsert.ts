import type { MachineSpecs } from "@nuster/turbine/types";

/**
 * Check whether an array item matches a removal criterion (recursive, partial).
 *
 * Mirrors `matches_criterion` in turbine's addons/deep-insert.ts — the two
 * implementations must stay in step, this file being the simulation's copy.
 *
 * - Primitives match by strict equality.
 * - Objects match when every field listed in the criterion matches the item
 *   (extra item fields are ignored).
 * - Arrays match as a prefix: every listed element must match the item at the
 *   same index, so `["regulators#rd-pressure"]` matches both
 *   `["regulators#rd-pressure", 0]` and `["regulators#rd-pressure", { ... }]`.
 */
function matchesCriterion(item: unknown, criterion: unknown): boolean
{
    if(criterion === null || typeof criterion !== "object")
        return item === criterion;
    if(item === null || typeof item !== "object")
        return false;

    if(Array.isArray(criterion))
    {
        if(!Array.isArray(item))
            return false;
        return criterion.every((sub, index) => matchesCriterion((item as Array<unknown>)[index], sub));
    }

    return Object.entries(criterion as Record<string, unknown>).every(([key, val]) => matchesCriterion((item as Record<string, unknown>)[key], val));
}

/**
 * Insert deeply on nested sub objects for the IMachineSpecs interface
 * @param obj IMachineSpecs specs
 * @param value Value added to IMachineSpecs spec
 * @param objPath Path where the object should be added
 * @returns IMachineSpecs specs
 */
export function deepInsert(obj: MachineSpecs, value: unknown, objPath: string, method: "replace" | "merge" | "set" | "remove"): MachineSpecs {

    let index;

    let tempObj: MachineSpecs | any = obj;

    const path = objPath.split(".");

    for (index = 0; index < path.length - 1; index++)
    {
        tempObj = tempObj[path[index]]
    }

    if(method == "replace")
    {
        //If the last path has an index, it will add himself after this index
        if(!isNaN(parseInt(path[index])))
            if(Array.isArray(value))
                tempObj.splice(path[index], value.length, ...value);
            else
                tempObj.splice(path[index], 1, value);
        else
            tempObj[path[index]] = value;
    }
    else if (method == "set")
    {
        tempObj[path[index]] = value;
    }
    else if (method == "merge")
    {
        //If the last path has an index, it will add himself after this index
        if(!isNaN(parseInt(path[index])))
            if(Array.isArray(value))
                tempObj.splice(path[index], 0, ...value);
            else
                tempObj.splice(path[index], 0, value);
        else
            if(Array.isArray(value))
                tempObj[path[index]].push(...value);
            else
                tempObj[path[index]] = {...tempObj[path[index]], ...value as any};
    }
    else if (method == "remove")
    {
        const target = tempObj[path[index]];

        // When the path points to an array, `value` is a list of match
        // criteria: every item matching at least one criterion is removed.
        if(Array.isArray(target))
        {
            const criteria = (Array.isArray(value) ? value : [value]) as Array<unknown>;
            tempObj[path[index]] = target.filter((item) => !criteria.some((criterion) => matchesCriterion(item, criterion)));
        }
        // When the path points to an object, `value` is a list of property
        // keys to delete from it.
        else if(target !== null && typeof target === "object")
        {
            const keys = (Array.isArray(value) ? value : [value]) as Array<string>;
            for(const key of keys)
                delete target[key];
        }
    }
    return obj;
}