import { Cycle } from "../controllers/cycle/Cycle";
import { Machine } from "../Machine";
import { ProgramBlockRunner } from "./ProgramBlockRunner";

export class BlockProgramInterpreter
{
    cycleInstance: Cycle;

    name: string;
    machine: Machine;

    cycle?: ProgramBlockRunner;

    constructor(cycleInstance: Cycle, name: string, machine: Machine)
    {
        this.cycleInstance = cycleInstance;
        this.name = name;
        this.machine = machine;

        let index = this.machine.specs.cycle.findIndex((c) => c.name == this.name);

        if(index > -1)
        {
            this.cycle = new ProgramBlockRunner(this.cycleInstance, this.machine.specs.cycle[index]);  
        }
    }
}