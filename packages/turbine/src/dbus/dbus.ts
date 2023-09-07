import { systemBus, type DBusMessage, type BodyEntry, type MessageBus } from '@homebridge/dbus-native';

export class DBusClient
{
	private dbus: MessageBus;

	constructor()
	{
		this.dbus = systemBus();
	}

	/** Promisified version of `dbus.invoke` */
	public async dbusInvoker<T extends BodyEntry>(message: DBusMessage): Promise<T>
	{

    return new Promise((resolve, reject) => {
        return this.dbus.invoke(message, (error, response) => {
            if(error)
                reject(error)
            else
                resolve(response as T)
        });
    });
}

	/** Get a property from the bus */
	public async getProperty<T extends BodyEntry>(service: string, objectPath: string, objectInterface: string, property: string): Promise<T> {
    
		const message: DBusMessage = {
			destination: service,
			path: objectPath,
			interface: 'org.freedesktop.DBus.Properties',
			member: 'Get',
			signature: 'ss',
			body: [objectInterface, property] 
		}

		return await this.dbusInvoker(message);
	}
}


