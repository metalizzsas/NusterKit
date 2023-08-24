import { systemBus, type DBusMessage, type BodyEntry } from 'dbus-native';

export const dbus = systemBus();

/** Promisified version of `dbus.invoke` */
export function dbusInvoker<T extends BodyEntry>(message: DBusMessage): Promise<T> {

    return new Promise((resolve, reject) => {
        return dbus.invoke(message, (error, response) => {
            if(error)
                reject(error)
            else
                resolve(response as T)
        });
    });
}

/** Get a property from the bus */
export async function getProperty<T extends BodyEntry>(service: string, objectPath: string, objectInterface: string, property: string): Promise<T> {
    
	const message: DBusMessage = {
		destination: service,
		path: objectPath,
		interface: 'org.freedesktop.DBus.Properties',
		member: 'Get',
		signature: 'ss',
		body: [objectInterface, property] 
	}

	return await dbusInvoker(message);
}