import { IMachine } from "./IMachine";

type Prev = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
    11, 12, 13, 14, 15, 16, 17, 18, 19, 20, ...0[]]

type Join<K, P> = K extends string | number ?
    P extends string | number ?
    `${K}${"" extends P ? "" : "."}${P}`
    : never : never;

type Paths<T, D extends number = 10> = [D] extends [never] ? never : T extends object ?
    { [K in keyof T]-?: K extends string | number ?
        `${K}` | Join<K, Paths<T[K], Prev[D]>>
        : never
    }[keyof T] : ""

export type IMachinePaths = Paths<IMachine>

export declare interface IAddon
{
    /** Addon name, should be the same as the Json file holding him */
    addonName: string,
    /** Addon content Array  */
    content: IAddonContent[]
}

interface IAddonContent
{
    /** Path were the content is added */
    path: IMachinePaths;
    /** Content replaced or inserted to this category */
    content: unknown;
}
