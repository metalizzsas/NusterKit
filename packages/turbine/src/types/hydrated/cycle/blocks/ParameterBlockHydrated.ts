export type ParameterBlockHydrated<T> = 
{
    readonly name: string;
    get data(): T
}

export type StringParameterBlockHydrated = ParameterBlockHydrated<string>
export type NumericParameterBlockHydrated = ParameterBlockHydrated<number>

export type StatusParameterBlockHydrated =  ParameterBlockHydrated<"error" | "warning" | "good"> & 
{
    subscriber: ((data: "error" | "warning" | "good") => void) | undefined;

    /** Subscribe to block data change */
    subscribe(callback: (data: "error" | "warning" | "good") => void): void
}