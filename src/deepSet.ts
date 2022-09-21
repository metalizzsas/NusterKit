import { IMachine } from "./interfaces/IMachine";
import { IMachinePaths } from "./interfaces/IAddon";

export function deepInsert(obj: IMachine, value: unknown, objPath: IMachinePaths): IMachine {

    let index;

    let tempObj: IMachine | any = obj;

    const path = objPath.split(".");

    for (index = 0; index < path.length - 1; index++)
    {
        tempObj = tempObj[path[index]]
    }

    //If the last path has an index, it will add himself after this index
    if(!isNaN(parseInt(path[index])))
        tempObj.splice(0, path[index], value);
    else
        tempObj[path[index]] = value;

    return obj;
}