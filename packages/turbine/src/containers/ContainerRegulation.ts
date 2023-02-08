import type { ContainerRegulationHydrated } from "@metalizzsas/nuster-typings/build/hydrated/containers";
import type { ContainerRegulation as ContainerRegulationConfig } from "@metalizzsas/nuster-typings/build/spec/containers";
import type { IOGateJSON } from "@metalizzsas/nuster-typings/build/hydrated/io";

import { TurbineEventLoop } from "../events";

export class ContainerRegulation implements ContainerRegulationConfig
{
    name: string;
    current: number;
    state = false;
    target: number;
    maxTarget: number;

    security: Array<{ name: string, value: number }>;

    sensor: string;
    active: Array<string>;
    minus: Array<string>;
    plus: Array<string>;

    #sensorGate?: IOGateJSON;

    #securityGates: Array<{name: string, value: number, gate?: IOGateJSON}> = [];

    #parentName: string;
    
    constructor(parentName: string, regulation: ContainerRegulationConfig)
    {
        this.name = regulation.name;
        this.#parentName = parentName;

        /// - State
     
        this.current = regulation.target;
        this.target = regulation.target;
        this.maxTarget = regulation.maxTarget;

        /// - Gates

        this.sensor = regulation.sensor;
        this.security = regulation.security;

        this.active = regulation.active;
        this.minus = regulation.minus ?? [];
        this.plus = regulation.plus;

        TurbineEventLoop.on(`container.${this.#parentName}.regulation.${this.name}.set_state`, (options) => { 
            this.state = options.state;

            if(options.state === false)
            {
                this.setActuators("plus", false);
                this.setActuators("minus", false);
                this.setActuators("active", false);
            }

            options.callback?.(this.state);

        });
        TurbineEventLoop.on(`container.${this.#parentName}.regulation.${this.name}.set_target`, (options) => { 
            this.target = options.target; 
            options.callback?.(this.target);
        });

        TurbineEventLoop.on(`container.${this.#parentName}.regulation.${this.name}.read`, ({ callback }) => {
            callback?.(this.toJSON());
        });

        TurbineEventLoop.on(`io.updated.${this.sensor}`, (gate) => { this.#sensorGate = gate });

        for(const s of this.security)
        {
            this.#securityGates.push({
                name: s.name,
                value: s.value
            });

            TurbineEventLoop.on(`io.updated.${s.name}`, (gate) => { 
                const g = this.#securityGates?.find(sg => sg.name == gate.name ); 
                if(g !== undefined) { 
                    g.gate = gate;
                }
            });
        }

        setInterval(this.regulationLoop.bind(this), 10000);
    }

    get value(): number
    {
        return this.#sensorGate?.value ?? 0;
    }

    /** Regulation loop, will be executed periodicaly */
    private regulationLoop()
    {
        let allGood = true;

        if(this.#securityGates)
            allGood = this.#securityGates.map(s => s.value == s.gate?.value).reduce((p, c) => p && c, true);

        if(allGood === false && this.state === true)
        {
            this.state = false;
            this.setActuators("plus", false);
            this.setActuators("minus", false);
            this.setActuators("active", false);

            TurbineEventLoop.emit("nuster.modal", {
                title: "container.regulation.modal.security_disable.title",
                message: "container.regulation.modal.security_disable.message",
                level: "error"
            });
        }

        if(this.value > (this.maxTarget + 1))
        {
            // Advert the user that maxtarget has been reached
            if(this.state !== false)
            {
                TurbineEventLoop.emit("nuster.modal", {
                    title: "container.regulation.modal.over_max_target.title",
                    message: "container.regulation.modal.over_max_target.message",
                    level: "warn"
                });
            }

            this.state = false;
            this.setActuators("plus", false);
            this.setActuators("minus", false);
            this.setActuators("active", false);
        }

        if(this.state === true && this.#sensorGate && allGood)
        {
            // If state is enabled force active actuators to be set to `enabled`.
            this.setActuators("active", true, true);

            // If current value is more than target + 0.25
            // enable minus actuators
            if(this.#sensorGate.value > this.target + 0.25)
                this.setActuators("minus", true, true);
            else
                this.setActuators("minus", false, true);
    
            // if current value in less than target
            // enable plus actuators otherwise disable plus actuators
            if(this.#sensorGate.value < this.target)
                this.setActuators("plus", true, true);
            else
                this.setActuators("plus", false, true);
        }

        TurbineEventLoop.emit(`container.${this.#parentName}.regulation.${this.name}.updated`, this.toJSON());
    }

    /**
     * Sets the actuators to the designed set
     * @param actuators actuators to be modified
     * @param state state to be set
     * @param lock Lock state to be set
     */
    private async setActuators(actuators: "minus" | "plus" | "active", state: boolean, lock = false)
    {
        const actuatorsElement = actuators === "minus" ? this.minus : actuators === "plus" ? this.plus : this.active;

        for (const actuator of actuatorsElement) {
            await new Promise<void>(resolve => {
                TurbineEventLoop.emit(`io.update.${actuator}`, { value: state === true ? 1 : 0, lock, callback: () => {
                    resolve();
                }});
            });
        }
    }

    toJSON(): ContainerRegulationHydrated
    {
        return {
            name: this.name,
            current: this.value, 
            currentUnity: this.#sensorGate?.unity,
            state: this.state, 
            target: this.target,
            maxTarget: this.maxTarget
        }
    }
}