import type { ContainerRegulationHydrated } from "@metalizzsas/nuster-typings/build/hydrated/containers";
import type { ContainerRegulation as ContainerRegulationConfig } from "@metalizzsas/nuster-typings/build/spec/containers";
import type { IOGateJSON } from "@metalizzsas/nuster-typings/build/hydrated/io";

import type { Container } from "./Containers";
import { TurbineEventLoop } from "../events";

export class ContainerRegulation implements ContainerRegulationConfig
{
    #parentName: string;
    name: string;
    current: number;
    state = false;
    target: number;
    maxTarget: number;
    securityMax: number;

    security: Array<{ name: string, value: number } | { name: string, valueDiff: number }>;

    sensor: string;
    active: Array<string>;
    minus: Array<string>;
    plus: Array<string>;

    #sensorGate?: IOGateJSON;

    #securityGates: Array<({ name: string, value: number } | { name: string, valueDiff: number }) & {gate?: IOGateJSON}> = [];
    
    constructor(parent: Container, regulation: ContainerRegulationConfig)
    {
        this.name = regulation.name;
        this.#parentName = parent.name;

        /// - State
     
        this.current = regulation.target;
        this.target = regulation.target;
        this.maxTarget = regulation.maxTarget;
        this.securityMax = regulation.securityMax;

        /// - Gates

        this.sensor = regulation.sensor;
        this.security = regulation.security;

        this.active = regulation.active;
        this.minus = regulation.minus ?? [];
        this.plus = regulation.plus;

        TurbineEventLoop.on(`container.${parent.name}.regulation.${this.name}.set_state`, (options) => { 
            this.state = options.state;

            if(options.state === false)
            {
                this.setActuators("plus", false);
                this.setActuators("minus", false);
                this.setActuators("active", false);
            }

            options.callback?.(this.state);

        });
        TurbineEventLoop.on(`container.${parent.name}.regulation.${this.name}.set_target`, (options) => { 
            this.target = options.target; 
            options.callback?.(this.target);
        });

        TurbineEventLoop.on(`io.updated.${this.sensor}`, (gate) => { this.#sensorGate = gate });

        for(const s of this.security)
        {
            if("valueDiff" in s)
            {
                this.#securityGates.push({
                    name: s.name,
                    valueDiff: s.valueDiff
                });
            }
            else
            {
                this.#securityGates.push({
                    name: s.name,
                    value: s.value
                });
            }

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
        let allGood: string[] = [];

        if(this.#securityGates)
            allGood = this.#securityGates.map(s => {
                if("valueDiff" in s)
                    return s.valueDiff != s.gate?.value ? undefined : s.name;
                else
                    return s.value == s.gate?.value ? undefined : s.name;
            }).filter((k): k is string => k !== undefined);

        if(allGood.length > 0 && this.state === true)
        {
            this.state = false;
            this.setActuators("plus", false);
            this.setActuators("minus", false);
            this.setActuators("active", false);

            allGood.forEach(k => {
                TurbineEventLoop.emit("nuster.modal", {
                    title: "container.regulation.modal.security_disable.title",
                    message: "container.regulation.modal.security_disable.message",
                    level: "error",
                    payload: {
                        gate: `gates.names.${k}`,
                        container: `containers.${this.#parentName}.name`,
                        regulation: `containers.${this.#parentName}.regulations.${this.name}`
                    }
                });
            })

        }

        if(this.value > this.securityMax)
        {
            // Advert the user that maxtarget has been reached
            if(this.state !== false)
            {
                TurbineEventLoop.emit("nuster.modal", {
                    title: "container.regulation.modal.over_security_max.title",
                    message: "container.regulation.modal.over_security_max.message",
                    level: "warn",
                    payload: {
                        container: `containers.${this.#parentName}.name`,
                        regulation: `containers.${this.#parentName}.regulations.${this.name}`,
                        securityMax: `${this.securityMax} ${this.#sensorGate?.unity}`
                    }
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