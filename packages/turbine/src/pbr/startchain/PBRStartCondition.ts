import { EPBRMode } from "@metalizzsas/nuster-typings/src/spec/cycle/IProgramBlockRunner";
import { IPBRStartCondition, EPBRStartConditionResult } from "@metalizzsas/nuster-typings/src/spec/cycle/programblocks/startchain/IPBRStartCondition";
import { LoggerInstance } from "../../app";
import { ProgramBlockRunner } from "../ProgramBlockRunner";
import { PBRSCCheckChain } from "./PBRSCCheckChain";

export class PBRStartCondition implements IPBRStartCondition
{
    #pbrInstance: ProgramBlockRunner;

    conditionName: string;
    startOnly: boolean;

    checkChain: PBRSCCheckChain;

    result: EPBRStartConditionResult;
    resultTimer?: NodeJS.Timer;

    constructor(pbrsc: IPBRStartCondition, pbrInstance: ProgramBlockRunner)
    {
        this.#pbrInstance = pbrInstance;

        this.conditionName = pbrsc.conditionName;
        this.startOnly = pbrsc.startOnly;
        this.checkChain = new PBRSCCheckChain(pbrsc.checkChain);

        this.result = EPBRStartConditionResult.ERROR;

        this.startTimer();
    }

    public startTimer()
    {
        LoggerInstance.trace("PBRSC: Started timer for " + this.conditionName);
        this.resultTimer = setInterval(() => { 

            //Checking CheckChain data
            const tempResult = this.checkChain.data();

            if(tempResult !== this.result && process.env.NODE_ENV == 'production')                
                LoggerInstance.info("PBRSC: Start condition " + this.conditionName + " changed to " + tempResult);

            if(process.env.NODE_ENV != 'production' && tempResult == EPBRStartConditionResult.ERROR)
            {
                this.result = EPBRStartConditionResult.GOOD;
            }
            else
            {
                this.result = tempResult;

                //if the condition is not good stop the cycle
                if(this.result == EPBRStartConditionResult.ERROR && this.#pbrInstance.status.mode == EPBRMode.STARTED)
                {
                    LoggerInstance.warn("PBRSC: Security condition " + this.conditionName + " has forced the cycle to End.");
                    this.#pbrInstance.end("security-" + this.conditionName);
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
        return this.result !== EPBRStartConditionResult.ERROR;
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