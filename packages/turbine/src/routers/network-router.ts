import type { BodyEntry } from "@homebridge/dbus-native";
import { DBusClient } from "../dbus/dbus";
import { NetworkManagerTypes } from "../dbus/network-manager-types";
import { compute_subnet, string_to_array_of_bytes } from "../dbus/network-utils";
import { TurbineEventLoop } from "../events";
import type { AccessPoint, NetworkDevice } from "../types/hydrated/balena";

export class NetworkRouter {
	private accessPoints: AccessPoint[] = [];
	private devices: NetworkDevice[] = [];
	private dbus_client: DBusClient;

	constructor() {
		this.dbus_client = new DBusClient();

		// Amorçage au démarrage, sans attendre. Les erreurs doivent être avalées
		// ici : depuis que les appels D-Bus expirent au lieu de rester pendants,
		// une machine dont le bus ne répond pas produirait deux rejets non gérés —
		// donc un process mort au boot au lieu d'un simple écran réseau vide.
		this.getDevices().catch((err) => {
			TurbineEventLoop.emit("log", "warning", `Network: initial device scan failed: ${(err as Error).message}`);
		});

		this.listWifiNetworks().catch((err) => {
			TurbineEventLoop.emit("log", "warning", `Network: initial wifi scan failed: ${(err as Error).message}`);
		});
	}

	/**
	 * Fetch network devices from the Dbus
	 * @async
	 * @returns Array of network devices
	 */
	public async getDevices(): Promise<NetworkDevice[]> {
		const device_paths: string[] = await this.dbus_client.dbusInvoker({
			destination: "org.freedesktop.NetworkManager",
			path: "/org/freedesktop/NetworkManager",
			interface: "org.freedesktop.NetworkManager",
			member: "GetDevices",
		});

		const devices: NetworkDevice[] = [];

		for (const path of device_paths) {
			const device: Partial<NetworkDevice> = {};

			const device_i_face = await this.dbus_client.getProperty<[BodyEntry, [string]]>(
				"org.freedesktop.NetworkManager",
				path,
				"org.freedesktop.NetworkManager.Device",
				"Interface",
			);

			if (!["wlan0", "enp1s0u1"].includes(device_i_face[1][0])) continue;

			device.iface = device_i_face[1][0];
			device.path = path;

			const device_state = await this.dbus_client.getProperty<[BodyEntry, [number]]>(
				"org.freedesktop.NetworkManager",
				path,
				"org.freedesktop.NetworkManager.Device",
				"State",
			);

			if (device_state[1][0] === NetworkManagerTypes.DEVICE_STATE.ACTIVATED) {
				const IP4Config = await this.dbus_client.getProperty<[BodyEntry, [string]]>(
					"org.freedesktop.NetworkManager",
					path,
					"org.freedesktop.NetworkManager.Device",
					"Ip4Config",
				);
				const addresses = await this.dbus_client.getProperty<
					[[BodyEntry], [Array<Array<Array<Array<Array<string | number | { type: string; child: [] }>>>>>]]
				>("org.freedesktop.NetworkManager", IP4Config[1][0], "org.freedesktop.NetworkManager.IP4Config", "AddressData");
				const gateway = await this.dbus_client.getProperty<[[BodyEntry], [string]]>(
					"org.freedesktop.NetworkManager",
					IP4Config[1][0],
					"org.freedesktop.NetworkManager.IP4Config",
					"Gateway",
				);

				device.gateway = gateway[1][0];
				device.address = addresses[1][0][0][0][1][1][0] as string;
				device.subnet = compute_subnet(addresses[1][0][0][1][1][1][0] as number);
			}

			devices.push(device as NetworkDevice);
		}

		this.devices = devices;
		TurbineEventLoop.emit("ws.dirty", "network");

		return devices;
	}

	/**
	 * List the available wifi networks over `wlan0`interface
	 * @async
	 * @returns List of wifi networks
	 */
	public async listWifiNetworks(): Promise<AccessPoint[]> {
		const devices = await this.getDevices();
		const accessPoints: AccessPoint[] = [];

		const wlan0 = devices.find((device) => device.iface === "wlan0");

		if (wlan0 === undefined) throw new Error("Main physical wifi device not found.");

		//Request a scan of the networks using dbus
		await this.dbus_client.dbusInvoker({
			destination: "org.freedesktop.NetworkManager",
			path: wlan0.path,
			interface: "org.freedesktop.NetworkManager.Device.Wireless",
			member: "RequestScan",
			signature: "a{sv}",
			body: [{ ssids: [] }],
		});

		const [, [activeAccessPointPath]] = await this.dbus_client.getProperty<[[BodyEntry], [string]]>(
			"org.freedesktop.NetworkManager",
			wlan0.path,
			"org.freedesktop.NetworkManager.Device.Wireless",
			"ActiveAccessPoint",
		);

		const access_point_paths: string[] = await this.dbus_client.dbusInvoker({
			destination: "org.freedesktop.NetworkManager",
			path: wlan0.path,
			interface: "org.freedesktop.NetworkManager.Device.Wireless",
			member: "GetAllAccessPoints",
		});

		for (const access_point_path of access_point_paths) {
			const access_point_ssid = await this.dbus_client.getProperty<[[BodyEntry], [Buffer]]>(
				"org.freedesktop.NetworkManager",
				access_point_path,
				"org.freedesktop.NetworkManager.AccessPoint",
				"Ssid",
			);
			const access_point_strengh = await this.dbus_client.getProperty<[[BodyEntry], [number]]>(
				"org.freedesktop.NetworkManager",
				access_point_path,
				"org.freedesktop.NetworkManager.AccessPoint",
				"Strength",
			);
			const access_point_frenquency = await this.dbus_client.getProperty<[[BodyEntry], [number]]>(
				"org.freedesktop.NetworkManager",
				access_point_path,
				"org.freedesktop.NetworkManager.AccessPoint",
				"Frequency",
			);
			const access_point_encryption = await this.dbus_client.getProperty<[[BodyEntry], [number]]>(
				"org.freedesktop.NetworkManager",
				access_point_path,
				"org.freedesktop.NetworkManager.AccessPoint",
				"RsnFlags",
			);

			accessPoints.push({
				ssid: access_point_ssid[1][0].toString(),
				strength: access_point_strengh[1][0],
				frenquency: access_point_frenquency[1][0],
				encryption: access_point_encryption[1][0],
				active: access_point_path === activeAccessPointPath,
				path: access_point_path,
			} satisfies AccessPoint);
		}

		this.accessPoints = accessPoints;
		TurbineEventLoop.emit("ws.dirty", "network");

		return accessPoints;
	}

	/**
	 * Connect to a wifi network
	 * @param ssid SSID of the network to connect to
	 * @param password Password of the network to connect to
	 * @returns True if the connection was successful
	 * @async
	 */
	public async connectToWifi(ssid: string, password?: string | undefined): Promise<boolean> {
		let created_connection: string | undefined;

		try {
			const wlan0 = this.devices.find((device) => device.iface === "wlan0");

			if (wlan0 === undefined) throw new Error("Main physical wifi device not found.");

			if (this.accessPoints.some((ap) => ap.active)) throw new Error("Already connected to a wifi network.");

			const ap = this.accessPoints.find((ap) => ap.ssid === ssid);

			if (ap === undefined) throw new Error("Access point used not found.");

			if (ap.active) throw new Error("Already connected to this wifi network.");

			const connection_params = [
				[
					"connection",
					[
						["id", ["s", ssid]],
						["type", ["s", "802-11-wireless"]],
						["autoconnect", ["b", true]],
						["autoconnect-priority", ["i", 10]],
						["interface-name", ["s", wlan0.iface]],
					],
				],
				[
					"802-11-wireless",
					[
						["ssid", ["ay", string_to_array_of_bytes(ssid)]],
						["mode", ["s", "infrastructure"]],
					],
				],
				["ipv4", [["method", ["s", "auto"]]]],
				["ipv6", [["method", ["s", "auto"]]]],
			] satisfies BodyEntry[];

			if (password !== undefined && ap.encryption > 0) {
				let key_mgmt: "wep" | "ieee8021x" | "wpa-psk" | "sae" | "owe" | "wpa-aep" | "wpa-eap-suite-b-192" = "wpa-psk";

				switch (ap.encryption) {
					case NetworkManagerTypes.AP_802_11_SEC.PAIR_WEP104:
					case NetworkManagerTypes.AP_802_11_SEC.PAIR_WEP40:
					case NetworkManagerTypes.AP_802_11_SEC.GROUP_WEP40:
					case NetworkManagerTypes.AP_802_11_SEC.GROUP_WEP104:
						key_mgmt = "wep";
						break;
					default:
						key_mgmt = "wpa-psk";
						break;
				}

				connection_params.push([
					"802-11-wireless-security",
					[
						["key-mgmt", ["s", key_mgmt]],
						["psk", ["s", password]],
					],
				]);
			}

			created_connection = await this.dbus_client.dbusInvoker<string>({
				destination: "org.freedesktop.NetworkManager",
				path: "/org/freedesktop/NetworkManager/Settings",
				interface: "org.freedesktop.NetworkManager.Settings",
				member: "AddConnection",
				signature: "a{sa{sv}}",
				body: [connection_params],
			});

			const result = await this.dbus_client.dbusInvoker<string>({
				destination: "org.freedesktop.NetworkManager",
				path: "/org/freedesktop/NetworkManager",
				interface: "org.freedesktop.NetworkManager",
				member: "ActivateConnection",
				signature: "ooo",
				body: [created_connection, wlan0.path, "/"],
			});

			await this.getDevices();
			await this.listWifiNetworks();

			return result !== undefined;
		} catch (error) {
			if (created_connection) {
				TurbineEventLoop.emit("log", "info", `Network: Deleting wrong connection ${created_connection}.`);
				await this.dbus_client.dbusInvoker({
					destination: "org.freedesktop.NetworkManager",
					path: "/org/freedesktop/NetworkManager/Settings",
					interface: "org.freedesktop.NetworkManager.Settings.Connection",
					member: "Delete",
					signature: "o",
					body: [created_connection],
				});
			}

			TurbineEventLoop.emit("log", "error", JSON.stringify(error));
			return false;
		}
	}

	/**
	 * Disconnect from the current wifi network
	 * @throws
	 */
	public async disconnectFromWifi(): Promise<void> {
		try {
			const wifi_devices = await this.getDevices();
			const wlan0 = wifi_devices.find((device) => device.iface === "wlan0");

			if (wlan0 === undefined) throw new Error("Main physical wifi device not found.");

			TurbineEventLoop.emit("log", "info", `Network: Disconnecting from wifi network.`);

			const [, [applied_connection]] = await this.dbus_client.getProperty<[[BodyEntry], [string]]>(
				"org.freedesktop.NetworkManager",
				wlan0.path,
				"org.freedesktop.NetworkManager.Device",
				"ActiveConnection",
			);

			if (applied_connection !== undefined) {
				const [, [rootConnection]] = await this.dbus_client.getProperty<[BodyEntry, [string]]>(
					"org.freedesktop.NetworkManager",
					applied_connection,
					"org.freedesktop.NetworkManager.Connection.Active",
					"Connection",
				);

				if (rootConnection !== undefined) {
					TurbineEventLoop.emit("log", "info", `Network: Deleting connection ${applied_connection}.`);
					await this.dbus_client.dbusInvoker({
						destination: "org.freedesktop.NetworkManager",
						path: rootConnection,
						interface: "org.freedesktop.NetworkManager.Settings.Connection",
						member: "Delete",
					});
				}
			}

			await this.dbus_client.dbusInvoker({
				destination: "org.freedesktop.NetworkManager",
				path: wlan0.path,
				interface: "org.freedesktop.NetworkManager.Device",
				member: "Disconnect",
			});
		} catch (error) {
			TurbineEventLoop.emit("log", "error", JSON.stringify(error));
			throw new Error(`Failed to disconnect from the wifi network (${error}).`);
		}
	}

	get socket_data() {
		return {
			accessPoints: this.accessPoints,
			devices: this.devices,
		};
	}
}
