import type { NumericParameterBlockHydrated, StatusParameterBlockHydrated } from "@metalizzsas/nuster-typings/build/hydrated/cycle/blocks/ParameterBlockHydrated";
import type { PBRStartConditionResult, PBRStartCondition as PBRStartConditionConfig } from "@metalizzsas/nuster-typings/build/spec/cycle/PBRStartCondition";
import type { PBRMode } from "@metalizzsas/nuster-typings/build/hydrated/cycle/ProgramBlockRunnerHydrated";

import { ParameterBlockRegistry } from "./ParameterBlocks/ParameterBlockRegistry";
import { TurbineEventLoop } from "../events";
import type { IOGateJSON } from "@metalizzsas/nuster-typings/build/hydrated/io";

export class PBRSecurityCondition
{
    name: string;
    startOnly: boolean;
    disabled: NumericParameterBlockHydrated | undefined;
    scc: PBRStartConditionConfig;

    state: PBRStartConditionResult = "error";

    #statusBlock: StatusParameterBlockHydrated | undefined;
    #pbrState: PBRMode = "creating";

    constructor(pbrsc: PBRStartConditionConfig)
    {
        this.name = pbrsc.conditionName;
        this.startOnly = pbrsc.startOnly;
        this.scc = pbrsc;

        if(pbrsc.disabled)
            this.disabled = ParameterBlockRegistry.Numeric(pbrsc.disabled);

        TurbineEventLoop.on('pbr.status.update', (state) => this.#pbrState = state);

        if(this.disabled?.data === 1)
        {
            this.state = "disabled";
            return;
        }

        if(pbrsc.checkchain.io !== undefined)
            TurbineEventLoop.on(`io.updated.${pbrsc.checkchain.io.gateName}`, this.gateListener.bind(this));

        if(pbrsc.checkchain.parameter !== undefined)
        {
            this.#statusBlock = ParameterBlockRegistry.Status(pbrsc.checkchain.parameter);
            this.state = this.#statusBlock.data;

            /** Subscribe to status block data change */
            this.#statusBlock.subscribe((data) => {
                this.state = data;
            });
        }
    }

    private gateListener(gate: IOGateJSON)
    {
        this.state = (gate.value === this.scc.checkchain.io?.gateValue) ? "good" : "error";

        if(this.state === "error" && this.#pbrState === "started")
            TurbineEventLoop.emit(`pbr.stop`, `security-${this.name}`)
    }

    private pbrStateListener(state: PBRMode) {
        this.#pbrState = state;
    }

    /** Dispose Security Condition */
    public dispose()
    {
        TurbineEventLoop.removeListener(`io.updated.${this.scc.checkchain.io?.gateName}`, this.gateListener);
        TurbineEventLoop.removeListener('pbr.status.update', this.pbrStateListener);
    }

    get canStart(): boolean
    {
        return this.state !== "error";
    }

    toJSON()
    {
        return {
            conditionName: this.name,
            startOnly: this.startOnly,
            result: this.state
        }
    }
}