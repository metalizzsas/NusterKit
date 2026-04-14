import type { NumericParameterBlockHydrated, StatusParameterBlockHydrated } from "$types/hydrated/cycle/blocks/ParameterBlockHydrated";
import type { PBRStartConditionResult, PBRRunCondition as PBRRunConditionConfig } from "$types/spec/cycle/PBRRunCondition";
import type { PBRMode } from "$types/hydrated/cycle/ProgramBlockRunnerHydrated";

import { ParameterBlockRegistry } from "./ParameterBlocks/ParameterBlockRegistry";
import { TurbineEventLoop } from "../events";
import type { IOGateJSON } from "$types/hydrated/io";
import type { PBRContext } from "../services/PBRContext";

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
    #pbrStateListenerReference: ((state: PBRMode) => void) | undefined = undefined;

    subscriber: ((data: { name: string, startOnly: boolean, result: PBRStartConditionResult }) => void) | undefined = undefined;

    private ctx?: PBRContext;

    constructor(pbrsc: PBRRunConditionConfig, subscribeCallback?: (data: { name: string, startOnly: boolean, result: PBRStartConditionResult }) => void, ctx?: PBRContext)
    {
        this.name = pbrsc.name;
        this.startOnly = pbrsc.startOnly;
        this.scc = pbrsc;
        this.ctx = ctx;

        this.subscriber = subscribeCallback;

        if(pbrsc.disabled)
            this.disabled = ParameterBlockRegistry.Numeric(pbrsc.disabled, ctx);

        this.#pbrStateListenerReference = (state: PBRMode) => { this.#pbrState = state; };

        if (this.ctx) {
            this.ctx.pbrEmitter.on("status.update", this.#pbrStateListenerReference);
        } else {
            TurbineEventLoop.on('pbr.status.update', this.#pbrStateListenerReference);
        }

        if(this.disabled?.data === 1)
        {
            this.state = "disabled";
            return;
        }

        if(pbrsc.checkchain.io !== undefined)
        {
            this.#gateListenerReference = this.gateListener.bind(this);
            if (this.ctx) {
                this.ctx.io.on(`updated.${pbrsc.checkchain.io.gateName}`, this.#gateListenerReference);
            } else {
                TurbineEventLoop.on(`io.updated.${pbrsc.checkchain.io.gateName}`, this.#gateListenerReference);
            }
        }

        if(pbrsc.checkchain.parameter !== undefined)
        {
            this.#statusBlock = ParameterBlockRegistry.Status(pbrsc.checkchain.parameter, ctx);
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

    /** Dispose Security Condition */
    public dispose()
    {
        if (this.ctx) {
            if (this.#gateListenerReference && this.scc.checkchain.io) {
                this.ctx.io.off(`updated.${this.scc.checkchain.io.gateName}`, this.#gateListenerReference);
            }
            if (this.#pbrStateListenerReference) {
                this.ctx.pbrEmitter.off("status.update", this.#pbrStateListenerReference);
            }
        } else {
            if (this.#gateListenerReference) { TurbineEventLoop.removeListener(`io.updated.${this.scc.checkchain.io?.gateName}`, this.#gateListenerReference); }
            if (this.#pbrStateListenerReference) { TurbineEventLoop.removeListener('pbr.status.update', this.#pbrStateListenerReference); }
        }
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