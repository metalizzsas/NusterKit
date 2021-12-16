import { IOController } from "./IOController";
import { IOGate } from "./IOGates/IOGate";

/**
 * A tool to explorer Gate annuary in NusterTurbine
 * This tool is necesssary because gates are sotres in an array instead of a dictionary
 */
export class IOExplorer
{
    ioController?: IOController;

    constructor(ioController: IOController){
        this.ioController = ioController;
    }

    /**
     * Find an IOGate in the ioexplorer
     * @param name Gate name to find
     * @returns Returns undefined if the gate name is not fount
     */
    public explore(name: string): IOGate | undefined
    {
        return this.ioController?.gates.find((g) => g.name == name);
    }
}