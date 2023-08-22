import { systemBus, type Message, type Bus, type BodyEntry } from 'dbus-native';

export const dbus: Bus = systemBus();

export function dbusInvoker<T extends BodyEntry>(message: Message): Promise<T>{

    return new Promise<T>((resolve, reject) => {
        return dbus.invoke(message, (error, response) => {
            if(error)
                reject(error)
            else
                resolve(response as T)
        });
    });
}

export async function getProperty<T extends BodyEntry>(service: string, objectPath: string, objectInterface: string, property: string): Promise<T>{
    
	const message: Message = {
		destination: service,
		path: objectPath,
		interface: 'org.freedesktop.DBus.Properties',
		member: 'Get',
		signature: 'ss',
		body: [objectInterface, property] 
	}

	return await dbusInvoker(message);
}