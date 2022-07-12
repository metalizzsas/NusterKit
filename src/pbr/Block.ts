import { ProgramBlockRunner } from "./ProgramBlockRunner";

export class Block {
    
    pbrInstance: ProgramBlockRunner;

    constructor(instance: ProgramBlockRunner) {
        this.pbrInstance = instance;
    }
}