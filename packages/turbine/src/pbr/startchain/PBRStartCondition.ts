import type { NumericParameterBlockHydrated } from "@metalizzsas/nuster-typings/build/hydrated/cycle/blocks/ParameterBlockHydrated";
import type { IPBRStartConditionHydrated } from "@metalizzsas/nuster-typings/build/hydrated/cycle/IPBRStartConditionHydrated";
import type { EPBRStartConditionResult, IPBRStartCondition } from "@metalizzsas/nuster-typings/build/spec/cycle/security/IPBRStartCondition";

import type { ProgramBlockRunner } from "../ProgramBlockRunner";

import { LoggerInstance } from "../../app";
import { ParameterBlockRegistry } from "../ParameterBlocks/ParameterBlockRegistry";
import { PBRStartConditionCheck } from "./PBRStartConditionCheck";

export class PBRStartCondition implements IPBRStartConditionHydrated
{
    #pbrInstance: ProgramBlockRunner;

    conditionName: string;
    startOnly: boolean;

    disabled?: NumericParameterBlockHydrated

    check: PBRStartConditionCheck;
    checkchain: IPBRStartConditionHydrated["checkchain"]

    result: EPBRStartConditionResult;
    resultTimer?: NodeJS.Timer;

    constructor(pbrsc: IPBRStartCondition, pbrInstance: ProgramBlockRunner)
    {
        this.#pbrInstance = pbrInstance;

        this.conditionName = pbrsc.conditionName;
        this.startOnly = pbrsc.startOnly;
        this.check = new PBRStartConditionCheck(pbrsc.checkchain);
        this.checkchain = this.check.check.bind(this.check);

        this.result = "error";

        if(pbrsc.disabled !== undefined)
            this.disabled = ParameterBlockRegistry.Numeric(pbrsc.disabled);

        this.startTimer();
    }

    public startTimer()
    {
        LoggerInstance.trace("PBRSC: Started timer for " + this.conditionName);
        this.resultTimer = setInterval(() => { 

            if(this.disabled && this.disabled.data == 1)
            {
                this.result = "disabled";
                return;
            }

            //Checking CheckChain data
            const tempResult = this.checkchain();

            if(tempResult !== this.result && process.env.NODE_ENV == 'production')                
                LoggerInstance.info("PBRSC: Start condition " + this.conditionName + " changed to " + tempResult);

            this.result = tempResult;

            //if the condition is not good stop the cycle
            if(this.result == "error" && this.#pbrInstance.status.mode == "started")
            {
                LoggerInstance.warn("PBRSC: Security condition " + this.conditionName + " has forced the cycle to End.");
                this.#pbrInstance.end("security-" + this.conditionName);
            }

        }, 250);
    }

    public stopTimer()
    {
        if(this.resultTimer)
        {
            clearInterval(this.resultTimer);
            LoggerInstance.info(" ↳ Stopped timer for " + this.conditionName);
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