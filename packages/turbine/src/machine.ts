import type WebSocket from "ws";

import * as pack from "../package.json";
import { parseAddon } from "./addons/addon-loader";
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

	maintenanceRouter: MaintenanceRouter;
	ioRouter: IORouter;
	profileRouter: ProfilesRouter;
	containerRouter: ContainersRouter;
	cycleRouter: CycleRouter;
	networkRouter?: NetworkRouter;
	callToActionRouter: CalltoActionRouter;

	services!: ServiceRegistry;

	WebSocketServer?: WebSocket.Server = undefined;

	//Balena given data
	private hypervisorData?: HypervisorData;
	private vpnData?: VPNData;
	private hypervisorInterval?: ReturnType<typeof setInterval>;

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

				if (addon) this.specs = parseAddon(this.specs, addon);
				else TurbineEventLoop.emit("log", "error", `Addon: ${add} does not exists.`);
			}
		}

		// Machine Specific addon parsing
		if (this.data.machineAddons.length > 0) {
			TurbineEventLoop.emit("log", "warning", `Machine: Configuration has ${this.data.machineAddons.length} machine specific addon(s).`);
			for (const add of this.data.machineAddons) this.specs = parseAddon(this.specs, add);
		}

		TurbineEventLoop.emit("log", "info", "Machine: Instantiating controllers");

		this.callToActionRouter = new CalltoActionRouter();
		this.ioRouter = new IORouter(this.specs.iohandlers, this.specs.iogates);
		this.profileRouter = new ProfilesRouter(this.specs.profileSkeletons, this.specs.profilePremades);
		this.maintenanceRouter = new MaintenanceRouter(this.specs.maintenance);
		this.containerRouter = new ContainersRouter(this.specs.containers, this.specs.containerProducts);
		this.cycleRouter = new CycleRouter(this.specs.cycleTypes, this.specs.cyclePremades);
		if (process.env.NODE_ENV === "production") {
			this.networkRouter = new NetworkRouter();
		}

		TurbineEventLoop.emit("log", "info", "Machine: Finished Instantiating controllers");

		// Assemble ServiceRegistry for dependency injection into PBR
		this.services = {
			io: this.ioRouter,
			containers: this.containerRouter,
			maintenance: this.maintenanceRouter,
			profiles: this.profileRouter,
			machine: {
				readVariable: (name: string) => this.data.settings.variables.find((v) => v.name === name)?.value ?? 0,
				getConfig: () => this.specs,
			},
			logger: {
				log: (level, message) => TurbineEventLoop.emit("log", level, message),
			},
		};

		// Pass services to CycleRouter for PBR construction
		this.cycleRouter.serviceRegistry = this.services;

		// Add event listener for machine variable reads
		for (const variable of this.data.settings.variables) {
			TurbineEventLoop.on(`machine.read_variable.${variable.name}`, ({ callback }) => {
				callback?.(variable.value);
			});
		}

		//Polling the balenaOS Hypervisor data if device is not in dev mode
		if (process.env.NODE_ENV === "production") {
			this.hypervisorInterval = setInterval(async () => {
				try {
					const statusRes = await fetch(`${process.env.BALENA_SUPERVISOR_ADDRESS}/v2/state/status?apikey=${process.env.BALENA_SUPERVISOR_API_KEY}`, {
						headers: { "Content-Type": "application/json" },
					});
					if (statusRes.status === 200) {
						this.hypervisorData = await statusRes.json();
					}
				} catch {
					TurbineEventLoop.emit("log", "warning", "Hypervisor: Failed to get Device Hypervisor data.");
				}

				try {
					const vpnRes = await fetch(`${process.env.BALENA_SUPERVISOR_ADDRESS}/v2/device/vpn?apikey=${process.env.BALENA_SUPERVISOR_API_KEY}`, {
						headers: { "Content-Type": "application/json" },
					});
					if (vpnRes.status === 200) {
						this.vpnData = await vpnRes.json();
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
	public async socketData(): Promise<Status> {
		const containers = await this.containerRouter.socketData();

		return {
			cycle: this.cycleRouter.socketData,
			containers: containers,
			io: this.ioRouter.socketData,
			maintenance: this.maintenanceRouter.socketData(),
			network: this.networkRouter?.socketData ?? { devices: [], accessPoints: [] },
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
		if (this.hypervisorInterval) {
			clearInterval(this.hypervisorInterval);
			this.hypervisorInterval = undefined;
		}
	}
}
