import { type BodyEntry, type DBusMessage, type MessageBus, systemBus } from "@homebridge/dbus-native";

export class DBusClient {
	private dbus: MessageBus;

	constructor() {
		this.dbus = systemBus();
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
