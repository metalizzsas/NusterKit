import { IMachine, IMachinePaths } from "./interfaces/IMachine";
/**
 * Insert deeply on nested sub objects for the IMachine interface
 * @param obj IMachine specs
 * @param value Value added to IMachine spec
 * @param objPath Path where the object should be added
 * @returns IMachine specs
 */
export function deepInsert(obj: IMachine, value: unknown, objPath: IMachinePaths, method: "replace" | "merge"): IMachine {

    let index;

    let tempObj: IMachine | any = obj;

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
                tempObj[path[index]].push(value);
    }
    return obj;
}