import type WebSocket from "ws";
import * as pack from "../package.json";
import { parse_addon } from "./addons/addon-loader";
import { TurbineEventLoop } from "./events";
import { NetworkRouter } from "./routers";
import { CalltoActionRouter } from "./routers/call-to-action";
import { ContainersRouter } from "./routers/containers-routers";
import { CycleRouter } from "./routers/cycle-router";
import { IORouter } from "./routers/io-router";
import { MaintenanceRouter } from "./routers/maintenances-router";
import { ProfilesRouter } from "./routers/profiles-router";
import type { ServiceRegistry } from "./services/interfaces";
import type { Configuration, MachineSpecs, Status } from "./types";
import type { HypervisorData, VPNData } from "./types/hydrated/balena";
import type { MachineData } from "./types/hydrated/machine";

export class Machine {
	data: Configuration;
	specs: MachineSpecs;

	maintenance_router: MaintenanceRouter;
	io_router: IORouter;
	profile_router: ProfilesRouter;
	container_router: ContainersRouter;
	cycle_router: CycleRouter;
	network_router?: NetworkRouter;
	call_to_action_router: CalltoActionRouter;

	services!: ServiceRegistry;

	WebSocketServer?: WebSocket.Server = undefined;

	//Balena given data
	private hypervisorData?: HypervisorData;
	private vpnData?: VPNData;
	private hypervisor_interval?: ReturnType<typeof setInterval>;

	constructor(data: Configuration, specs: MachineSpecs) {
		this.data = data;
		this.specs = specs;

		TurbineEventLoop.on("machine.config", (callback) => {
			callback(this.specs);
		});

		// Addon Parsing
		if (this.data.addons !== undefined && this.data.addons.length > 0) {
			TurbineEventLoop.emit("log", "warning", "Machine: " + this.data.addons.length + " Addon(s) detected.");
			for (const add of this.data.addons) {
				const addon = this.specs.addons?.find((a) => a.addonName == add);

				if (addon) this.specs = parse_addon(this.specs, addon);
				else TurbineEventLoop.emit("log", "error", `Addon: ${add} does not exists.`);
			}
		}

		// Machine Specific addon parsing
		if (this.data.machineAddons.length > 0) {
			TurbineEventLoop.emit("log", "warning", `Machine: Configuration has ${this.data.machineAddons.length} machine specific addon(s).`);
			for (const add of this.data.machineAddons) this.specs = parse_addon(this.specs, add);
		}

		TurbineEventLoop.emit("log", "info", "Machine: Instantiating controllers");

		this.call_to_action_router = new CalltoActionRouter();
		this.io_router = new IORouter(this.specs.iohandlers, this.specs.iogates);
		this.profile_router = new ProfilesRouter(this.specs.profileSkeletons, this.specs.profilePremades);
		this.maintenance_router = new MaintenanceRouter(this.specs.maintenance);
		this.container_router = new ContainersRouter(this.specs.containers, this.specs.containerProducts);
		this.cycle_router = new CycleRouter(this.specs.cycleTypes, this.specs.cyclePremades);
		if (process.env.NODE_ENV === "production") {
			this.network_router = new NetworkRouter();
		}

		TurbineEventLoop.emit("log", "info", "Machine: Finished Instantiating controllers");

		// Assemble ServiceRegistry for dependency injection into PBR
		this.services = {
			io: this.io_router,
			containers: this.container_router,
			maintenance: this.maintenance_router,
			profiles: this.profile_router,
			machine: {
				read_variable: (name: string) => this.data.settings.variables.find((v) => v.name === name)?.value ?? 0,
				get_config: () => this.specs,
			},
			logger: {
				log: (level, message) => TurbineEventLoop.emit("log", level, message),
			},
		};

		// Pass services to CycleRouter for PBR construction
		this.cycle_router.service_registry = this.services;

		// Add event listener for machine variable reads
		for (const variable of this.data.settings.variables) {
			TurbineEventLoop.on(`machine.read_variable.${variable.name}`, ({ callback }) => {
				callback?.(variable.value);
			});
		}

		//Polling the balenaOS Hypervisor data if device is not in dev mode
		if (process.env.NODE_ENV === "production") {
			this.hypervisor_interval = setInterval(async () => {
				try {
					const status_res = await fetch(`${process.env.BALENA_SUPERVISOR_ADDRESS}/v2/state/status?apikey=${process.env.BALENA_SUPERVISOR_API_KEY}`, {
						headers: { "Content-Type": "application/json" },
					});
					if (status_res.status === 200) {
						this.hypervisorData = await status_res.json();
					}
				} catch {
					TurbineEventLoop.emit("log", "warning", "Hypervisor: Failed to get Device Hypervisor data.");
				}

				try {
					const vpn_res = await fetch(`${process.env.BALENA_SUPERVISOR_ADDRESS}/v2/device/vpn?apikey=${process.env.BALENA_SUPERVISOR_API_KEY}`, {
						headers: { "Content-Type": "application/json" },
					});
					if (vpn_res.status === 200) {
						this.vpnData = await vpn_res.json();
					}
				} catch {
					TurbineEventLoop.emit("log", "warning", "Hypervisor: Failed to get Device VPN data.");
				}
			}, 10000);
		}
	}

	/**
	 * Data send to the socket as a Status message in socket connection
	 * @returns Data hydrated for socket connection
	 */
	public async socket_data(): Promise<Status> {
		const containers = await this.container_router.socket_data();

		return {
			cycle: this.cycle_router.socket_data,
			containers: containers,
			io: this.io_router.socket_data,
			maintenance: this.maintenance_router.socket_data(),
			network: this.network_router?.socket_data ?? { devices: [], accessPoints: [] },
		} satisfies Status;
	}

	toJSON(): MachineData {
		return {
			...this.data,

			turbineVersion: pack.version,

			nuster: this.specs.nuster,

			hypervisorData: this.hypervisorData,
			vpnData: this.vpnData,
		};
	}

	dispose(): void {
		if (this.hypervisor_interval) {
			clearInterval(this.hypervisor_interval);
			this.hypervisor_interval = undefined;
		}
	}
}
