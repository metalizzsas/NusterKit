import type { ContainerRegulationHydrated } from "$types/hydrated/containers";
import type { IOGateJSON } from "$types/hydrated/io";
import type { ContainerRegulation as ContainerRegulationConfig } from "$types/spec/containers";
import { TurbineEventLoop } from "../events";
import { callback_with_timeout } from "../utils/callback-with-timeout";
import type { Container } from "./containers";

export class ContainerRegulation implements ContainerRegulationConfig {
	#parent_name: string;
	private regulation_timer?: ReturnType<typeof setInterval>;
	name: string;
	current: number;
	state = false;
	target: number;
	maxTarget: number;
	securityMax: number;

	security: Array<{ name: string; value: number } | { name: string; valueDiff: number }>;

	sensor: string;
	active: Array<string>;
	minus: Array<string>;
	plus: Array<string>;

	#sensorGate?: IOGateJSON;

	#securityGates: Array<({ name: string; value: number } | { name: string; valueDiff: number }) & { gate?: IOGateJSON }> = [];

	// Stored listener references for cleanup in dispose()
	private _on_get_state!: (options: { callback?: (state: boolean) => void }) => void;
	private _on_get_target!: (options: { callback?: (target: number) => void }) => void;
	private _on_set_state!: (options: { state: boolean; callback?: (state: boolean) => void }) => void;
	private _on_set_target!: (options: { target: number; callback?: (target: number) => void }) => void;
	private _on_sensor_update!: (gate: IOGateJSON) => void;
	private _security_gate_handlers: Array<{ event: string; handler: (gate: IOGateJSON) => void }> = [];

	constructor(parent: Container, regulation: ContainerRegulationConfig) {
		this.name = regulation.name;
		this.#parent_name = parent.name;

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

		this._on_get_state = ({ callback }) => {
			callback?.(this.state);
		};
		TurbineEventLoop.on(`container.${parent.name}.regulation.${this.name}.get_state`, this._on_get_state);

		this._on_get_target = ({ callback }) => {
			callback?.(this.target);
		};
		TurbineEventLoop.on(`container.${parent.name}.regulation.${this.name}.get_target`, this._on_get_target);

		this._on_set_state = (options) => {
			this.state = options.state;

			if (options.state === false) {
				this.setActuators("plus", false);
				this.setActuators("minus", false);
				this.setActuators("active", false);
			}

			options.callback?.(this.state);

			TurbineEventLoop.emit(`container.${parent.name}.regulation.${this.name}.state_updated`, this.state);
		};
		TurbineEventLoop.on(`container.${parent.name}.regulation.${this.name}.set_state`, this._on_set_state);

		this._on_set_target = (options) => {
			if (options.target > this.maxTarget) this.target = this.maxTarget;
			else this.target = options.target;

			options.callback?.(this.target);

			TurbineEventLoop.emit(`container.${parent.name}.regulation.${this.name}.target_updated`, this.target);
		};
		TurbineEventLoop.on(`container.${parent.name}.regulation.${this.name}.set_target`, this._on_set_target);

		this._on_sensor_update = (gate) => {
			this.#sensorGate = gate;
		};
		TurbineEventLoop.on(`io.updated.${this.sensor}`, this._on_sensor_update);

		for (const s of this.security) {
			if ("valueDiff" in s) {
				this.#securityGates.push({
					name: s.name,
					valueDiff: s.valueDiff,
				});
			} else {
				this.#securityGates.push({
					name: s.name,
					value: s.value,
				});
			}

			const handler = (gate: IOGateJSON) => {
				const g = this.#securityGates?.find((sg) => sg.name == gate.name);
				if (g !== undefined) {
					g.gate = gate;
				}
			};
			this._security_gate_handlers.push({ event: `io.updated.${s.name}`, handler });
			TurbineEventLoop.on(`io.updated.${s.name}`, handler);
		}

		this.regulation_timer = setInterval(this.regulation_loop.bind(this), 10000);
	}

	get value(): number {
		return this.#sensorGate?.value ?? 0;
	}

	/** Regulation loop, will be executed periodicaly */
	private regulation_loop() {
		let all_good: string[] = [];

		if (this.#securityGates)
			all_good = this.#securityGates
				.map((s) => {
					if ("valueDiff" in s) return s.valueDiff != s.gate?.value ? undefined : s.name;
					else return s.value == s.gate?.value ? undefined : s.name;
				})
				.filter((k): k is string => k !== undefined);

		if (all_good.length > 0 && this.state === true) {
			this.state = false;
			this.setActuators("plus", false);
			this.setActuators("minus", false);
			this.setActuators("active", false);

			all_good.forEach((k) => {
				TurbineEventLoop.emit("nuster.modal", {
					title: "container.regulation.modal.security_disable.title",
					message: "container.regulation.modal.security_disable.message",
					level: "error",
					payload: {
						gate: `gates.names.${k}`,
						container: `containers.${this.#parent_name}.name`,
						regulation: `containers.${this.#parent_name}.regulations.${this.name}`,
					},
				});
			});
		}

		if (this.value > this.securityMax) {
			// Advert the user that maxtarget has been reached
			if (this.state !== false) {
				TurbineEventLoop.emit("nuster.modal", {
					title: "container.regulation.modal.over_security_max.title",
					message: "container.regulation.modal.over_security_max.message",
					level: "warn",
					payload: {
						container: `containers.${this.#parent_name}.name`,
						regulation: `containers.${this.#parent_name}.regulations.${this.name}`,
						securityMax: `${this.securityMax} ${this.#sensorGate?.unity}`,
					},
				});
			}

			this.state = false;
			this.setActuators("plus", false);
			this.setActuators("minus", false);
			this.setActuators("active", false);
		}

		if (this.state === true && this.#sensorGate && all_good) {
			// If state is enabled force active actuators to be set to `enabled`.
			this.setActuators("active", true, true);

			// If current value is more than target + 0.25
			// enable minus actuators
			if (this.#sensorGate.value > this.target + 0.25) this.setActuators("minus", true, true);
			else this.setActuators("minus", false, true);

			// if current value in less than target
			// enable plus actuators otherwise disable plus actuators
			if (this.#sensorGate.value < this.target) this.setActuators("plus", true, true);
			else this.setActuators("plus", false, true);
		}
	}

	/**
	 * Sets the actuators to the designed set
	 * @param actuators actuators to be modified
	 * @param state state to be set
	 * @param lock Lock state to be set
	 */
	private async setActuators(actuators: "minus" | "plus" | "active", state: boolean, lock = false) {
		const actuators_element = actuators === "minus" ? this.minus : actuators === "plus" ? this.plus : this.active;

		for (const actuator of actuators_element) {
			await callback_with_timeout<void>(
				(resolve) => {
					TurbineEventLoop.emit(`io.update.${actuator}`, {
						value: state === true ? 1 : 0,
						lock,
						callback: () => {
							resolve();
						},
					});
				},
				5000,
				`ContainerRegulation.setActuators(${actuator})`,
			).catch((err) => {
				TurbineEventLoop.emit("log", "error", `ContainerRegulation: setActuators failed: ${(err as Error).message}`);
			});
		}
	}

	dispose(): void {
		if (this.regulation_timer) {
			clearInterval(this.regulation_timer);
			this.regulation_timer = undefined;
		}

		const parent_name = this.#parent_name;
		TurbineEventLoop.removeListener(`container.${parent_name}.regulation.${this.name}.get_state`, this._on_get_state);
		TurbineEventLoop.removeListener(`container.${parent_name}.regulation.${this.name}.get_target`, this._on_get_target);
		TurbineEventLoop.removeListener(`container.${parent_name}.regulation.${this.name}.set_state`, this._on_set_state);
		TurbineEventLoop.removeListener(`container.${parent_name}.regulation.${this.name}.set_target`, this._on_set_target);
		TurbineEventLoop.removeListener(`io.updated.${this.sensor}`, this._on_sensor_update);

		for (const { event, handler } of this._security_gate_handlers) {
			TurbineEventLoop.removeListener(event, handler);
		}
		this._security_gate_handlers = [];
	}

	toJSON(): ContainerRegulationHydrated {
		return {
			name: this.name,
			current: this.value,
			currentUnity: this.#sensorGate?.unity,
			state: this.state,
			target: this.target,
			maxTarget: this.maxTarget,
		};
	}
}
