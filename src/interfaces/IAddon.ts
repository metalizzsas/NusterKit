import { IMachineKeys, IMachineElements } from "./IMachine";

export declare interface IAddon
{
    addonName: string,
    content: IAddonContent[]
}

interface IAddonContent
{
    type: "replace" | "insert",
    category: IMachineKeys;
    content: IMachineElements;
}
