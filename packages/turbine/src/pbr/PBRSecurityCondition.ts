import type { NumericParameterBlockHydrated, StatusParameterBlockHydrated } from "$types/hydrated/cycle/blocks/ParameterBlockHydrated";
import type { PBRStartConditionResult, PBRRunCondition as PBRRunConditionConfig } from "$types/spec/cycle/PBRRunCondition";
import type { PBRMode } from "$types/hydrated/cycle/ProgramBlockRunnerHydrated";

import { ParameterBlockRegistry } from "./ParameterBlocks/ParameterBlockRegistry";
import { TurbineEventLoop } from "../events";
import type { IOGateJSON } from "$types/hydrated/io";

export class PBRRunCondition
{
    name: string;
    startOnly: boolean;

    disabledFlag = false;

    disabled: NumericParameterBlockHydrated | undefined;
    scc: PBRRunConditionConfig;

    state: PBRStartConditionResult = "error";

    #statusBlock: StatusParameterBlockHydrated | undefined;
    #pbrState: PBRMode = "creating";

    #gateListenerReference: (typeof this.gateListener) | undefined = undefined;

    subscriber: ((data: { name: string, startOnly: boolean, result: PBRStartConditionResult }) => void) | undefined = undefined;

    constructor(pbrsc: PBRRunConditionConfig, subscribeCallback?: (data: { name: string, startOnly: boolean, result: PBRStartConditionResult }) => void)
    {
        this.name = pbrsc.name;
        this.startOnly = pbrsc.startOnly;
        this.scc = pbrsc;

        this.subscriber = subscribeCallback;

        if(pbrsc.disabled)
            this.disabled = ParameterBlockRegistry.Numeric(pbrsc.disabled);

        TurbineEventLoop.on('pbr.status.update', (state) => this.#pbrState = state);

        if(this.disabled?.data === 1)
        {
            this.state = "disabled";
            return;
        }

        if(pbrsc.checkchain.io !== undefined)
        {
            this.#gateListenerReference = this.gateListener.bind(this);
            TurbineEventLoop.on(`io.updated.${pbrsc.checkchain.io.gateName}`, this.#gateListenerReference);
        }

        if(pbrsc.checkchain.parameter !== undefined)
        {
            this.#statusBlock = ParameterBlockRegistry.Status(pbrsc.checkchain.parameter);
            this.state = this.#statusBlock.data;

            /** Subscribe to status block data change */
            this.#statusBlock.subscribe((data) => {
                if(this.disabledFlag === true) return;
        
                this.state = data;

                if(this.state === "error" && this.#pbrState === "started")
                    this.subscriber?.(this.toJSON());
            });
        }
    }

    private gateListener(gate: IOGateJSON)
    {
        if(this.disabledFlag === true) return;
        this.state = (gate.value === this.scc.checkchain.io?.gateValue) ? "good" : "error";

        if(this.state === "error" && this.#pbrState === "started")
            this.subscriber?.(this.toJSON());
    }

    private pbrStateListener(state: PBRMode) {
        this.#pbrState = state;
    }

    /** Dispose Security Condition */
    public dispose()
    {
        if(this.#gateListenerReference) {  TurbineEventLoop.removeListener(`io.updated.${this.scc.checkchain.io?.gateName}`, this.#gateListenerReference); }
        TurbineEventLoop.removeListener('pbr.status.update', this.pbrStateListener);
        this.disabledFlag = true;
    }

    get canStart(): boolean
    {
        return this.state !== "error";
    }

    toJSON()
    {
        return {
            name: this.name,
            startOnly: this.startOnly,
            result: this.state
        }
    }
}