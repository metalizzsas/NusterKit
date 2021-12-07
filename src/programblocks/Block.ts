import { Cycle } from "../controllers/cycle/Cycle";

export class Block
{
    cycleInstance: Cycle
    constructor(cycleInstance: Cycle)
    {
        this.cycleInstance = cycleInstance;
    }
}