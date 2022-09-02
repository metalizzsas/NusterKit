import { IMachineKeys, IMachineElements } from "./IMachine";

export declare interface IAddon
{
    /** Addon name, shoudl be the same as the Json file holding him */
    addonName: string,
    /** Addon content Array  */
    content: IAddonContent[]
}

interface IAddonContent
{
    /** Addon Content mode replace: replaces all the content of the category, insert: Insert content in the category */
    type: "replace" | "insert",
    /** Category where the content is added to  */
    category: IMachineKeys;
    /** Content replaced or inserted to this category */
    content: IMachineElements;
}
