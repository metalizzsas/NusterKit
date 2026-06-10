import { type BodyEntry, type DBusMessage, type MessageBus, systemBus } from "@homebridge/dbus-native";

export class DBusClient {
	private dbus: MessageBus;

	constructor() {
		this.dbus = systemBus();

		// La socket D-Bus peut émettre un 'error' (ex. EPIPE quand NetworkManager
		// ne répond pas — typiquement en VM ou sans hôte balena complet). Sans
		// listener 'error', Node transforme ça en exception non gérée qui TUE tout
		// le process. On l'attrape : les fonctions réseau seront indisponibles,
		// mais turbine reste debout.
		(this.dbus as unknown as { connection?: { on?: (event: string, cb: (err: Error) => void) => void } }).connection?.on?.(
			"error",
			(err) => {
				console.error(`[DBusClient] D-Bus connection error (ignored): ${err?.message ?? err}`);
			},
		);
	}

	/** Promisified version of `dbus.invoke` */
	public async dbusInvoker<T extends BodyEntry>(message: DBusMessage): Promise<T> {
		return new Promise((resolve, reject) => {
			return this.dbus.invoke(message, (error, response) => {
				if (error) reject(error);
				else resolve(response as T);
			});
		});
	}

	/** Get a property from the bus */
	public async getProperty<T extends BodyEntry>(service: string, object_path: string, object_interface: string, property: string): Promise<T> {
		const message: DBusMessage = {
			destination: service,
			path: object_path,
			interface: "org.freedesktop.DBus.Properties",
			member: "Get",
			signature: "ss",
			body: [object_interface, property],
		};

		return await this.dbusInvoker(message);
	}
}
