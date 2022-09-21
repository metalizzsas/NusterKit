export declare interface IAddon
{
    /** Addon name, should be the same as the Json file holding him */
    addonName: string,
    /** Addon content Array  */
    content: IAddonContent[]
}

interface IAddonContent
{
    /** 
     * Path were the content is added
     * @warning As Template literals are **not supported** by json schema be careful about the path
     */
    path: string;

    /**
     * Insertion mode
     * @defaultValue `merge`
     */
    mode: "replace" | "merge";
    /** 
     * Content replaced or inserted to this category
     * @warning Content is not type aware about what you are adding here, **⚠ be careful**
     */
    content: unknown;
}
