import type { NumericParameterBlockHydrated } from "@metalizzsas/nuster-typings/build/hydrated/cycle/blocks/ParameterBlockHydrated";
import type { PBRStartConditionHydrated } from "@metalizzsas/nuster-typings/build/hydrated/cycle/PBRStartConditionHydrated";
import type { PBRStartConditionResult, PBRStartCondition as PBRStartConditionConfig } from "@metalizzsas/nuster-typings/build/spec/cycle/PBRStartCondition";

import type { ProgramBlockRunner } from "../ProgramBlockRunner";

import { LoggerInstance } from "../../app";
import { ParameterBlockRegistry } from "../ParameterBlocks/ParameterBlockRegistry";
import { PBRStartConditionCheck } from "./PBRStartConditionCheck";

export class PBRStartCondition implements PBRStartConditionHydrated
{
    #pbrInstance: ProgramBlockRunner;

    conditionName: string;
    startOnly: boolean;

    disabled?: NumericParameterBlockHydrated

    check: PBRStartConditionCheck;
    checkchain: PBRStartConditionHydrated["checkchain"]

    result: PBRStartConditionResult;
    resultTimer?: NodeJS.Timer;

    constructor(pbrsc: PBRStartConditionConfig, pbrInstance: ProgramBlockRunner)
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