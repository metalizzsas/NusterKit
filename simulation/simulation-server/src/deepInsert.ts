import type { MachineSpecs } from "@nuster/turbine/types";

/**
 * Insert deeply on nested sub objects for the IMachineSpecs interface
 * @param obj IMachineSpecs specs
 * @param value Value added to IMachineSpecs spec
 * @param objPath Path where the object should be added
 * @returns IMachineSpecs specs
 */
export function deepInsert(obj: MachineSpecs, value: unknown, objPath: string, method: "replace" | "merge" | "set"): MachineSpecs {

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
    return obj;
}