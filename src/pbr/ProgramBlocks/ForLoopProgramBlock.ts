import { EPBRMode } from "../../interfaces/IProgramBlockRunner";
import { ProgramBlockRunner } from "../ProgramBlockRunner";
import { IForLoopProgramBlock } from "../../interfaces/programblocks/ProgramBlocks/IForLoopProgramBlock";
import { ProgramBlock, ProgramBlocks } from "./index";
import { NumericParameterBlocks } from "../ParameterBlocks";
import { ParameterBlockRegistry } from "../ParameterBlocks/ParameterBlockRegistry";

export class ForLoopProgramBlock extends ProgramBlock implements IForLoopProgramBlock {

    name = "for" as const;

    params: [NumericParameterBlocks];
    blocks: ProgramBlocks[] = [];

    public currentIteration: number;

    constructor(pbrInstance: ProgramBlockRunner, obj: IForLoopProgramBlock)
    {
        super(pbrInstance, obj);

        this.params = [ParameterBlockRegistry(pbrInstance, obj.params[0]) as NumericParameterBlocks];

        super.fillProgramBlocks(obj);

        this.currentIteration = obj.currentIteration ?? 0;
    }

    public async execute() {
        const lC = this.params[0].data() as number;
        this.pbrInstance.machine.logger.info(`ForBlock: Will loop ${lC} times. Starting from: ${this.currentIteration}`);

        for (; this.currentIteration < (lC); this.currentIteration++) {
            if (this.pbrInstance.status.mode == EPBRMode.ENDED) {
                this.executed = (this.currentIteration + 1 == (lC));
                return;
            }

            for (const instuction of this.blocks) {
                await instuction.execute();
            }
        }

        this.currentIteration = 0; // reset current iteration if we dont, multiple steps execute for loops only at the begining
        this.executed = true;
    }
}

