import type { IPBRStartCondition} from "@metalizzsas/nuster-typings/build/spec/cycle/programblocks/startchain/IPBRStartCondition";
import type { EPBRStartConditionResult } from "@metalizzsas/nuster-typings/build/spec/cycle/programblocks/startchain/IPBRStartCondition";
import { LoggerInstance } from "../../app";
import type { NumericParameterBlocks } from "../ParameterBlocks";
import { ParameterBlockRegistry } from "../ParameterBlocks/ParameterBlockRegistry";
import type { ProgramBlockRunner } from "../ProgramBlockRunner";
import { PBRSCCheckChain } from "./PBRSCCheckChain";

export class PBRStartCondition implements IPBRStartCondition
{
    private pbrInstance: ProgramBlockRunner;

    conditionName: string;
    startOnly: boolean;

    disabled?: NumericParameterBlocks;

    checkChain: PBRSCCheckChain;

    result: EPBRStartConditionResult;
    resultTimer?: NodeJS.Timer;

    constructor(pbrsc: IPBRStartCondition, pbrInstance: ProgramBlockRunner)
    {
        this.pbrInstance = pbrInstance;

        this.conditionName = pbrsc.conditionName;
        this.startOnly = pbrsc.startOnly;
        this.checkChain = new PBRSCCheckChain(pbrsc.checkChain);

        this.result = "error";

        if(pbrsc.disabled !== undefined)
            this.disabled = ParameterBlockRegistry(pbrsc.disabled) as NumericParameterBlocks;

        this.startTimer();
    }

    public startTimer()
    {
        LoggerInstance.trace("PBRSC: Started timer for " + this.conditionName);
        this.resultTimer = setInterval(() => { 

            if(this.disabled && this.disabled.data() == 1)
            {
                this.result = "disabled";
                return;
            }

            //Checking CheckChain data
            const tempResult = this.checkChain.data();

            if(tempResult !== this.result && process.env.NODE_ENV == 'production')                
                LoggerInstance.info("PBRSC: Start condition " + this.conditionName + " changed to " + tempResult);

            if(process.env.NODE_ENV != 'production' && tempResult == "error")
            {
                this.result = "good";
            }
            else
            {
                this.result = tempResult;

                //if the condition is not good stop the cycle
                if(this.result == "error" && this.pbrInstance.status.mode == "started")
                {
                    LoggerInstance.warn("PBRSC: Security condition " + this.conditionName + " has forced the cycle to End.");
                    this.pbrInstance.end("security-" + this.conditionName);
                }
            }

        }, 250);
    }

    public stopTimer()
    {
        if(this.resultTimer)
        {
            clearInterval(this.resultTimer);
            LoggerInstance.info("PBRSC: Stopped timer for " + this.conditionName);
        }
    }

    //Return if we can start
    get canStart(): boolean
    {
        return this.result !== "error";
    }

    toJSON()
    {
        return {
            conditionName: this.conditionName,
            startOnly: this.startOnly,
            result: this.result
        }
    }
}

interface IPBRWatchdogStartCondition
{
    watchdogConditionGateName: string;
    watchdogConditionName: string;
}

export class PBRWatchdogStartCondition extends PBRStartCondition implements IPBRWatchdogStartCondition
{

    watchdogConditionGateName: string;
    watchdogConditionName: string;

    constructor(pbrsc: IPBRStartCondition, pbrInstance: ProgramBlockRunner)
    {
        super(pbrsc, pbrInstance);

        this.watchdogConditionGateName = pbrsc.conditionName;
        this.watchdogConditionName = pbrsc.conditionName;
    }
}