import type { IOGates } from "../../spec/iogates";

export type IOGatesHydrated = IOGates & { 
    category: string;
    value: number;
    locked: boolean;

    /** Reads the value of the gate */
    read(ignoreValueAssignement?: boolean): Promise<boolean | number>;
    /**
     * Writes data to the gate
     * @param data Data to write to the gate
     */
    write(data: number, ignoreValueAssignement?: boolean): Promise<boolean>;
};

export type IOGateJSON = {
    name: string,
    type: string,
    locked: boolean;
    category: string,
    value: number,
    unity: string | undefined,
    bus: "in" | "out",
    size: "bit" | "word"
}