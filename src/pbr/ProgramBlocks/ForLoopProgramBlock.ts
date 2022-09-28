import { EPBRMode } from "../../interfaces/IProgramBlockRunner";
import { IForLoopProgramBlock } from "../../interfaces/programblocks/ProgramBlocks/IForLoopProgramBlock";
import { ProgramBlock, ProgramBlocks } from "./index";
import { NumericParameterBlocks } from "../ParameterBlocks";
import { ParameterBlockRegistry } from "../ParameterBlocks/ParameterBlockRegistry";
import { LoggerInstance } from "../../app";
import { CycleController } from "../../controllers/cycle/CycleController";
import { PBRMissingError } from "../PBRMissingError";

export class ForLoopProgramBlock extends ProgramBlock implements IForLoopProgramBlock {

    name = "for" as const;

    params: [NumericParameterBlocks];
    blocks: ProgramBlocks[] = [];

    public currentIteration: number;

    constructor(obj: IForLoopProgramBlock)
    {
        super(obj);

        this.params = [ParameterBlockRegistry(obj.params[0]) as NumericParameterBlocks];

        super.fillProgramBlocks(obj);

        this.currentIteration = obj.currentIteration ?? 0;
    }

    /**
     * Execute for loop
     * @throws
     */
    public async execute()
    {
        const loopCount = this.params[0].data() as number;
        LoggerInstance.info(`ForBlock: Will loop ${loopCount} times. Starting from: ${this.currentIteration}`);

        const pbrInstance = CycleController.getInstance().program;

        if(pbrInstance !== undefined)
        {
            for (; this.currentIteration < (loopCount); this.currentIteration++) {
                //TODO: Make this check on step rather than cycle to ehance NextStep
                if (pbrInstance.status.mode == EPBRMode.ENDED)
                { 
                    this.executed = (this.currentIteration + 1 == (loopCount));
                    return;
                }
    
                for (const instuction of this.blocks) {
                    await instuction.execute();
                }
            }
    
            this.currentIteration = 0; // reset current iteration if we dont, multiple steps execute for loops only at the begining
            this.executed = true;
        }
        else
            throw new PBRMissingError("ForLoop");
    }
}

